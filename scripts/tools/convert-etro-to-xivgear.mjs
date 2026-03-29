#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_DATA_FILE = path.resolve("public/data/bis-links.json");

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i += 1;
  }
  return parsed;
}

function isEtroGearsetUrl(url) {
  if (typeof url !== "string") {
    return false;
  }
  return /^https?:\/\/etro\.gg\/gearset\/[a-f0-9-]+\/?$/i.test(url.trim());
}

async function maybeCloseWelcome(page) {
  const closeButton = page.locator("#welcome-close-button");
  if (await closeButton.count()) {
    try {
      await closeButton.first().click({ timeout: 2_000 });
    } catch {
      // No-op: modal is not always visible/clickable after it has been closed once.
    }
  }
}

async function openExportModal(page) {
  const exportButton = page.getByRole("button", { name: "Export Sheet" }).first();
  try {
    await exportButton.click({ timeout: 10_000 });
    return;
  } catch {
    // On smaller layouts, export controls are hidden behind the sheet menu.
  }

  const menuToggle = page.locator("button.show-hide-button").first();
  await menuToggle.click({ timeout: 10_000 });
  await exportButton.click({ timeout: 10_000 });
}

async function convertOne(page, etroUrl) {
  await page.goto("https://xivgear.app/?page=importsheet", {
    waitUntil: "domcontentloaded",
    timeout: 120_000
  });
  await maybeCloseWelcome(page);

  await page.locator('textarea[placeholder="Paste the link or JSON here"]').fill(etroUrl);
  await page.getByRole("button", { name: "Import" }).click();
  await page.waitForURL(/\?page=imported/, { timeout: 120_000 });
  await maybeCloseWelcome(page);

  await openExportModal(page);
  const simSelection = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h3"));
    const simHeading = headings.find((heading) =>
      /choose sims to export/i.test(heading.textContent || "")
    );
    if (!simHeading) {
      return { found: false, total: 0, checked: 0 };
    }

    const container = simHeading.parentElement ?? document.body;
    const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
    if (checkboxes.length === 0) {
      return { found: true, total: 0, checked: 0 };
    }

    let checked = checkboxes.filter((box) => box.checked).length;
    if (checked === 0) {
      for (const box of checkboxes) {
        box.click();
      }
      checked = checkboxes.filter((box) => box.checked).length;
    }

    return { found: true, total: checkboxes.length, checked };
  });

  if (!simSelection.found) {
    throw new Error(`Export modal did not expose "Choose Sims to Export" for ${etroUrl}`);
  }
  if (simSelection.total === 0) {
    throw new Error(`No sim options available to export for ${etroUrl}. Add a sim before exporting.`);
  }
  if (simSelection.checked === 0) {
    throw new Error(`Sim export selection failed for ${etroUrl}.`);
  }

  await page.getByRole("button", { name: "Generate" }).click();

  await page.waitForFunction(
    () => {
      const fields = Array.from(document.querySelectorAll("textarea, input"));
      return fields.some((field) => {
        const value = "value" in field ? String(field.value || "") : "";
        return value.includes("https://xivgear.app/?page=sl|");
      });
    },
    null,
    { timeout: 120_000 }
  );

  const shortlink = await page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll("textarea, input"));
    for (const field of fields) {
      const value = "value" in field ? String(field.value || "") : "";
      if (value.includes("https://xivgear.app/?page=sl|")) {
        return value;
      }
    }
    return null;
  });

  if (!shortlink) {
    throw new Error(`Could not extract XivGear shortlink for ${etroUrl}`);
  }

  return shortlink;
}

async function collectUrls(args) {
  const urls = new Set();

  if (typeof args.url === "string") {
    urls.add(args.url.trim());
  }

  if (typeof args.input === "string") {
    const inputPath = path.resolve(args.input);
    const raw = await fs.readFile(inputPath, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.urls) ? parsed.urls : [];
    for (const value of list) {
      if (typeof value === "string") {
        urls.add(value.trim());
      }
    }
  }

  if (args["from-data"] === true) {
    const dataPath = typeof args.data === "string" ? path.resolve(args.data) : DEFAULT_DATA_FILE;
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.entries)) {
      for (const row of parsed.entries) {
        const candidate =
          (row?.link && typeof row.link.url === "string" ? row.link.url : null) ??
          (row?.source && typeof row.source.url === "string" ? row.source.url : null) ??
          (typeof row?.linkUrl === "string" ? row.linkUrl : row?.sourceUrl);
        if (typeof candidate === "string" && candidate.includes("etro.gg/gearset/")) {
          urls.add(candidate.trim());
        }
      }
    }
  }

  const filtered = Array.from(urls).filter((url) => isEtroGearsetUrl(url));
  if (filtered.length === 0) {
    throw new Error(
      "No Etro gearset URLs found. Use --url, --input, or --from-data."
    );
  }
  return filtered;
}

async function applyMappingToData(dataPath, mapping) {
  const raw = await fs.readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.entries)) {
    throw new Error(`Data file ${dataPath} has no entries array.`);
  }

  let updatedCount = 0;
  for (const row of parsed.entries) {
    const currentLinkUrl =
      (row?.link && typeof row.link.url === "string" ? row.link.url : null) ??
      (row?.source && typeof row.source.url === "string" ? row.source.url : null) ??
      (typeof row?.linkUrl === "string" ? row.linkUrl : row?.sourceUrl);
    if (typeof currentLinkUrl !== "string") {
      continue;
    }
    const replacement = mapping[currentLinkUrl];
    if (!replacement) {
      continue;
    }
    row.link = {
      ...(row.link && typeof row.link === "object" ? row.link : {}),
      name: "XivGear",
      url: replacement
    };
    updatedCount += 1;
  }

  await fs.writeFile(dataPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return updatedCount;
}

function printHelp() {
  console.log(`Usage:
  node scripts/convert-etro-to-xivgear.mjs --url "https://etro.gg/gearset/<id>"
  node scripts/convert-etro-to-xivgear.mjs --input scripts/etro-urls.json
  node scripts/convert-etro-to-xivgear.mjs --from-data [--data public/data/bis-links.json]

Options:
  --url <url>         Convert one Etro gearset URL.
  --input <file>      JSON file with either an array of URLs or { "urls": [...] }.
  --from-data         Read Etro URLs from link.url fields in the data file.
  --data <file>       Data file path (default: public/data/bis-links.json).
  --update-data       Replace matching Etro link.url values in the data file.
  --output <file>     Write URL mapping JSON output to file.
  --headful           Run browser with UI (default: headless).
  --help              Show this message.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const etroUrls = await collectUrls(args);
  const dataPath = typeof args.data === "string" ? path.resolve(args.data) : DEFAULT_DATA_FILE;
  const outputPath = typeof args.output === "string" ? path.resolve(args.output) : null;

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: args.headful !== true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

  const mapping = {};
  try {
    for (const url of etroUrls) {
      const shortlink = await convertOne(page, url);
      mapping[url] = shortlink;
      console.log(`${url} => ${shortlink}`);
    }
  } finally {
    await browser.close();
  }

  if (outputPath) {
    await fs.writeFile(outputPath, `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
    console.log(`Wrote mapping: ${outputPath}`);
  }

  if (args["update-data"] === true) {
    const updatedRows = await applyMappingToData(dataPath, mapping);
    console.log(`Updated ${updatedRows} row(s) in ${dataPath}`);
  }

  if (args["update-data"] !== true && !outputPath) {
    console.log("");
    console.log("Tip: add --output <file> and/or --update-data to persist the result.");
  }
}

main().catch((error) => {
  console.error(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
