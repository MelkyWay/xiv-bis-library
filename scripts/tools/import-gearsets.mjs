#!/usr/bin/env node

import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const DATA_FILE_PATH = path.resolve("public/data/bis-links.json");
const CATEGORIES_CONFIG_PATH = path.resolve("src/config/categories.json");
const JOBS_CONFIG_PATH = path.resolve("src/config/jobs.json");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const categoryConfigRaw = JSON.parse(readFileSync(CATEGORIES_CONFIG_PATH, "utf8"));
const categoryOrder = Array.isArray(categoryConfigRaw?.order) ? categoryConfigRaw.order : [];
const VALID_CATEGORIES = new Set(categoryOrder);
const jobsConfigRaw = JSON.parse(readFileSync(JOBS_CONFIG_PATH, "utf8"));
const jobsConfigList = Array.isArray(jobsConfigRaw?.jobs) ? jobsConfigRaw.jobs : [];
const JOB_TO_ROLE = Object.fromEntries(
  jobsConfigList
    .filter(
      (job) =>
        job &&
        typeof job === "object" &&
        typeof job.code === "string" &&
        typeof job.role === "string"
    )
    .map((job) => [job.code.toUpperCase(), job.role])
);
const REQUIRED_INFO_BY_CATEGORY = {
  Ultimate: "encounter",
  Criterion: "encounter",
  Unreal: "encounter",
  Other: "encounter"
};

function contentKindForCategory(category) {
  return REQUIRED_INFO_BY_CATEGORY[category] ? "encounter" : "tier";
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
  const parsed = {};
  let i = 0;
  while (i < argv.length) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      i += 1;
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      i += 1;
      continue;
    }
    parsed[key] = next;
    i += 2;
  }
  return parsed;
}

function toKeyedMap(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input;
}

function toSetOverrides(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((row) => row && typeof row === "object" && !Array.isArray(row));
}

function splitSetName(name) {
  const compact = String(name ?? "").trim();
  const sep = compact.indexOf("|");
  if (sep === -1) {
    return { notes: compact };
  }
  const notes = compact.slice(0, sep).trim();
  const tooltip = compact.slice(sep + 1).trim();
  return {
    notes,
    tooltip
  };
}

function normalizeCategoryInfo(importConfig) {
  const category = importConfig.category;
  const info = importConfig.info ?? importConfig.encounter ?? importConfig.name ?? null;
  const kind = contentKindForCategory(category);
  if (kind === "tier") {
    return {
      content: {
        category,
        kind: "tier",
        value: importConfig.tier
      }
    };
  }
  if (!info || typeof info !== "string" || info.trim().length === 0) {
    throw new Error(`Category "${category}" requires --info (or "info" in config).`);
  }
  return {
    content: {
      category,
      kind: "encounter",
      value: info.trim()
    }
  };
}

function normalizePageUrl(urlInput) {
  const raw = String(urlInput ?? "").trim();
  if (!raw) {
    throw new Error("Import row is missing URL.");
  }

  const asUrl = new URL(raw);
  if (asUrl.hash.startsWith("#/bis/")) {
    const hashPath = asUrl.hash.slice(2);
    const segments = hashPath.split("/").filter(Boolean);
    if (segments.length >= 3 && segments[0] === "bis") {
      const page = segments.join("|");
      const canonical = new URL(`${asUrl.origin}${asUrl.pathname}`);
      canonical.searchParams.set("page", page);
      return canonical.toString();
    }
  }

  return raw;
}

function extractDataUrlFromHtml(html) {
  const preloadRegex = /<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const candidates = [];
  let match = preloadRegex.exec(html);
  while (match) {
    candidates.push(match[1]);
    match = preloadRegex.exec(html);
  }

  const preferred = candidates.find(
    (href) => href.includes("staticbis.xivgear.app/") || href.includes("api.xivgear.app/shortlink/")
  );

  if (preferred) {
    return preferred;
  }

  return null;
}

function guessDataUrlFromPage(pageUrl) {
  const parsed = new URL(pageUrl);
  const page = parsed.searchParams.get("page");
  if (!page) {
    return null;
  }
  const bits = page.split("|");
  if (bits[0] === "bis" && bits.length >= 3) {
    const job = bits[1].toLowerCase();
    const rest = bits.slice(2).join("/");
    return `https://staticbis.xivgear.app/${job}/${rest}.json`;
  }
  if (bits[0] === "sl" && bits[1]) {
    return `https://api.xivgear.app/shortlink/${bits[1]}`;
  }
  return null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}) for ${url}`);
  }
  return await response.json();
}

function toNumericLikeString(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(text)) {
    return null;
  }
  return text;
}

function inferSourceNameFromUrl(urlInput) {
  try {
    const host = new URL(String(urlInput ?? "")).hostname.toLowerCase();
    if (host.includes("thebalanceffxiv.com")) {
      return "The Balance";
    }
    if (host.includes("xivgear.app")) {
      return "XivGear";
    }
    if (host.includes("etro.gg")) {
      return "Etro";
    }
    return host.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

function classifyDamageTypeFromHeader(headerText) {
  const header = String(headerText ?? "").toLowerCase();
  if (header.includes("dmg/100p") || header.includes("100 potency") || header.includes("potency")) {
    return "potency";
  }
  return "sim";
}

async function extractSimDpsFromRenderedPage(pageUrl) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.warn("Sim DPS auto-read skipped: playwright is not installed.");
    return [];
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForSelector("table tbody tr", { timeout: 90_000 });

    const rows = await page.$$eval("table", (tables) => {
      const cleanText = (value) => (value || "").replaceAll(/\s+/g, " ").trim();

      const getHeaders = (table) => {
        const theadHeaders = Array.from(table.querySelectorAll("thead th")).map((th) =>
          cleanText(th.textContent)
        );
        if (theadHeaders.length > 0) {
          return theadHeaders;
        }

        const firstHeaderRow = Array.from(table.querySelectorAll("tr")).find(
          (tr) => tr.querySelectorAll("th").length >= 3
        );
        if (!firstHeaderRow) {
          return [];
        }

        return Array.from(firstHeaderRow.querySelectorAll("th")).map((th) =>
          cleanText(th.textContent)
        );
      };

      const findMetricColumnIndex = (headers) =>
        headers.findIndex((text, index) => {
          if (index < 1) {
            return false;
          }
          const lowered = text.toLowerCase();
          return lowered.includes("sim") || lowered.includes("dmg/100p") || lowered.includes("dps");
        });

      const inferMetricType = (headerText) => {
        const lowered = headerText.toLowerCase();
        return lowered.includes("dmg/100p") ||
          lowered.includes("100 potency") ||
          lowered.includes("potency")
          ? "potency"
          : "sim";
      };

      const extractRowsFromTable = (table) => {
        const headers = getHeaders(table);
        const metricColIndex = findMetricColumnIndex(headers);
        if (metricColIndex < 0) {
          return [];
        }

        const type = inferMetricType(headers[metricColIndex]);
        const out = [];
        const trs = Array.from(table.querySelectorAll("tr")).filter(
          (tr) => tr.querySelectorAll("td").length > 0
        );

        for (const tr of trs) {
          const tds = Array.from(tr.querySelectorAll("td"));
          if (tds.length <= metricColIndex) {
            continue;
          }
          const simText = (tds[metricColIndex].textContent || "").trim();
          const simValue = Number.parseFloat(simText);
          if (!Number.isFinite(simValue) || simValue <= 100) {
            continue;
          }
          out.push({ value: simValue.toFixed(2), type });
        }

        return out;
      };

      for (const table of tables) {
        const out = extractRowsFromTable(table);
        if (out.length > 0) {
          return out;
        }
      }

      return [];
    });

    return rows;
  } finally {
    await browser.close();
  }
}

async function resolveSheetPayload(inputUrl) {
  const normalizedPageUrl = normalizePageUrl(inputUrl);
  if (
    normalizedPageUrl.includes("staticbis.xivgear.app/") ||
    normalizedPageUrl.includes("api.xivgear.app/shortlink/")
  ) {
    return {
      dataUrl: normalizedPageUrl,
      pageUrl: null,
      payload: await fetchJson(normalizedPageUrl)
    };
  }

  const pageResponse = await fetch(normalizedPageUrl);
  if (!pageResponse.ok) {
    throw new Error(`Page fetch failed (${pageResponse.status}) for ${normalizedPageUrl}`);
  }
  const html = await pageResponse.text();
  const fromHtml = extractDataUrlFromHtml(html);
  const guessed = guessDataUrlFromPage(normalizedPageUrl);
  const dataUrl = fromHtml ?? guessed;
  if (!dataUrl) {
    throw new Error(`Could not find preload JSON URL in ${normalizedPageUrl}`);
  }
  return {
    dataUrl,
    pageUrl: normalizedPageUrl,
    payload: await fetchJson(dataUrl)
  };
}

function setOnlySetIndex(urlInput, index) {
  const parsed = new URL(urlInput);
  parsed.searchParams.set("onlySetIndex", String(index));
  return parsed.toString();
}

function pickSourceBaseUrl(importConfig, resolvedPageUrl) {
  if (
    typeof importConfig.sourceBaseUrl === "string" &&
    importConfig.sourceBaseUrl.trim().length > 0
  ) {
    return normalizePageUrl(importConfig.sourceBaseUrl);
  }
  if (resolvedPageUrl) {
    return resolvedPageUrl;
  }
  return normalizePageUrl(importConfig.url);
}

function getOnlySetIndexFromUrl(urlInput) {
  try {
    const parsed = new URL(urlInput);
    const value = parsed.searchParams.get("onlySetIndex");
    if (value === null) {
      return null;
    }
    const asNum = Number(value);
    return Number.isInteger(asNum) && asNum >= 0 ? asNum : null;
  } catch {
    return null;
  }
}

function normalizePayloadSets(sheetPayload) {
  if (Array.isArray(sheetPayload.sets)) {
    return sheetPayload.sets;
  }
  const hasSingleSetShape =
    sheetPayload &&
    typeof sheetPayload === "object" &&
    !Array.isArray(sheetPayload) &&
    typeof sheetPayload.name === "string" &&
    sheetPayload.items &&
    typeof sheetPayload.items === "object";
  if (!hasSingleSetShape) {
    return [];
  }
  return [
    {
      name: sheetPayload.name,
      description: typeof sheetPayload.description === "string" ? sheetPayload.description : "",
      isSeparator: false,
      items: sheetPayload.items
    }
  ];
}

function shouldIncludeSetIndex(index, importConfig) {
  const include = Array.isArray(importConfig.includeSetIndexes)
    ? importConfig.includeSetIndexes
    : null;
  const exclude = Array.isArray(importConfig.excludeSetIndexes)
    ? importConfig.excludeSetIndexes
    : null;
  if (include && !include.includes(index)) {
    return false;
  }
  if (exclude && exclude.includes(index)) {
    return false;
  }
  return true;
}

function normalizeImportConfig(rawConfig, globalDefaults) {
  const merged = {
    ...globalDefaults,
    ...rawConfig
  };

  if (typeof merged.url !== "string" || merged.url.trim().length === 0) {
    throw new Error("Each import row requires a non-empty URL.");
  }

  if (typeof merged.job !== "string" || merged.job.trim().length === 0) {
    throw new Error(`Import URL ${merged.url} is missing "job".`);
  }

  if (typeof merged.category !== "string" || !VALID_CATEGORIES.has(merged.category)) {
    throw new Error(`Import URL ${merged.url} has invalid category "${merged.category}".`);
  }

  if (typeof merged.tier !== "string" || !/^\d+\.\d+$/.test(merged.tier)) {
    throw new Error(
      `Import URL ${merged.url} has invalid tier "${merged.tier}". Expected format like 7.4.`
    );
  }

  const upperJob = merged.job.toUpperCase();
  const roleFromJob = JOB_TO_ROLE[upperJob];
  const role = merged.role ?? roleFromJob;
  if (!role || typeof role !== "string") {
    throw new Error(
      `Import URL ${merged.url} is missing role and role could not be derived from job ${upperJob}.`
    );
  }

  const updatedAt = merged.updatedAt ?? todayIsoDate();
  if (!DATE_RE.test(updatedAt)) {
    throw new Error(
      `Import URL ${merged.url} has invalid updatedAt "${updatedAt}". Expected YYYY-MM-DD.`
    );
  }

  const importedAt = merged.importedAt ?? updatedAt;
  if (!DATE_RE.test(importedAt)) {
    throw new Error(
      `Import URL ${merged.url} has invalid importedAt "${importedAt}". Expected YYYY-MM-DD.`
    );
  }

  return {
    ...merged,
    job: upperJob,
    role,
    importedAt,
    updatedAt,
    sourceName: merged.sourceName ?? "XivGear",
    replaceExisting: merged.replaceExisting !== false,
    skipSimDps: merged.skipSimDps === true,
    simDpsByName: toKeyedMap(merged.simDpsByName),
    simDpsByIndex: toKeyedMap(merged.simDpsByIndex),
    damageTypeByName: toKeyedMap(merged.damageTypeByName),
    damageTypeByIndex: toKeyedMap(merged.damageTypeByIndex),
    setNameMap: toKeyedMap(merged.setNameMap),
    setTooltipMap: toKeyedMap(merged.setTooltipMap),
    setOverrides: toSetOverrides(merged.setOverrides),
    includeSetIndexes: Array.isArray(merged.includeSetIndexes)
      ? merged.includeSetIndexes
          .map(Number)
          .filter((value) => Number.isInteger(value) && value >= 0)
      : (() => {
          const fromUrl = getOnlySetIndexFromUrl(merged.url);
          return fromUrl === null ? undefined : [fromUrl];
        })(),
    excludeSetIndexes: Array.isArray(merged.excludeSetIndexes)
      ? merged.excludeSetIndexes
          .map(Number)
          .filter((value) => Number.isInteger(value) && value >= 0)
      : undefined
  };
}

function resolveSetOverride(setName, setIndex, overrides) {
  for (const override of overrides) {
    const matchName = typeof override.matchName === "string" ? override.matchName : null;
    const matchIndex = Number.isInteger(override.matchIndex) ? override.matchIndex : null;
    if (matchName !== null && setName === matchName) {
      return override;
    }
    if (matchIndex !== null && setIndex === matchIndex) {
      return override;
    }
  }
  return null;
}

function parseDamageNumber(raw) {
  if (typeof raw !== "string") {
    return null;
  }
  const compact = raw.replaceAll(",", "").trim();
  if (!compact || compact === "-") {
    return null;
  }
  const parsed = Number.parseFloat(compact);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildEntriesFromSheet(sheetPayload, importConfig) {
  const sets = normalizePayloadSets(sheetPayload);
  const infoByCategory = normalizeCategoryInfo(importConfig);

  const entries = [];
  for (let i = 0; i < sets.length; i += 1) {
    const set = sets[i];
    if (!set || typeof set !== "object" || set.isSeparator) {
      continue;
    }
    if (!shouldIncludeSetIndex(i, importConfig)) {
      continue;
    }

    const rawName = typeof set.name === "string" ? set.name.trim() : `Set ${i + 1}`;
    const split = splitSetName(rawName);

    const mappedName = importConfig.setNameMap[rawName];
    const notes =
      typeof mappedName === "string" && mappedName.trim().length > 0
        ? mappedName.trim()
        : split.notes;

    const mapTooltip = importConfig.setTooltipMap[rawName];
    let notesTooltip =
      typeof set.description === "string" && set.description.trim().length > 0
        ? set.description.trim()
        : split.tooltip || undefined;
    if (typeof mapTooltip === "string" && mapTooltip.trim().length > 0) {
      notesTooltip = mapTooltip.trim();
    }

    const override = resolveSetOverride(rawName, i, importConfig.setOverrides);
    let finalNotes = notes;
    if (override && typeof override.notes === "string" && override.notes.trim().length > 0) {
      finalNotes = override.notes.trim();
    }

    if (override && typeof override.notesTooltip === "string") {
      notesTooltip = override.notesTooltip.trim() || undefined;
    }
    if (
      override &&
      typeof override.appendTooltip === "string" &&
      override.appendTooltip.trim().length > 0
    ) {
      notesTooltip = notesTooltip
        ? `${notesTooltip}\n\n${override.appendTooltip.trim()}`
        : override.appendTooltip.trim();
    }
    if (
      typeof importConfig.appendToAllTooltips === "string" &&
      importConfig.appendToAllTooltips.trim().length > 0
    ) {
      notesTooltip = notesTooltip
        ? `${notesTooltip}\n\n${importConfig.appendToAllTooltips.trim()}`
        : importConfig.appendToAllTooltips.trim();
    }

    let simDps = "-";
    if (!importConfig.skipSimDps) {
      if (typeof importConfig.simDpsByIndex[String(i)] === "string") {
        simDps = importConfig.simDpsByIndex[String(i)];
      } else if (typeof importConfig.simDpsByName[rawName] === "string") {
        simDps = importConfig.simDpsByName[rawName];
      } else if (override && typeof override.simDps === "string") {
        simDps = override.simDps;
      } else if (typeof importConfig.autoSimDpsByIndex[String(i)] === "string") {
        simDps = importConfig.autoSimDpsByIndex[String(i)];
      }
    }

    const numericDamage = parseDamageNumber(simDps);
    let damageType = numericDamage === null ? "none" : "sim";
    if (typeof importConfig.damageTypeByIndex[String(i)] === "string") {
      damageType = importConfig.damageTypeByIndex[String(i)];
    } else if (typeof importConfig.damageTypeByName[rawName] === "string") {
      damageType = importConfig.damageTypeByName[rawName];
    } else if (override && typeof override.damageType === "string") {
      damageType = override.damageType;
    } else if (typeof importConfig.autoDamageTypeByIndex[String(i)] === "string") {
      damageType = importConfig.autoDamageTypeByIndex[String(i)];
    }
    if (damageType !== "sim" && damageType !== "potency" && damageType !== "none") {
      damageType = simDps === "-" ? "none" : "sim";
    }
    if (numericDamage === null) {
      damageType = "none";
    }
    const damageValue = damageType === "none" ? null : numericDamage;

    const sourceBaseUrl = pickSourceBaseUrl(importConfig, importConfig._resolvedPageUrl);
    const linkUrl = setOnlySetIndex(sourceBaseUrl, i);
    const sourceUrl =
      typeof importConfig.sourceUrl === "string" && importConfig.sourceUrl.trim().length > 0
        ? importConfig.sourceUrl.trim()
        : linkUrl;
    const sourceName =
      typeof importConfig.sourceNameForSource === "string" &&
      importConfig.sourceNameForSource.trim().length > 0
        ? importConfig.sourceNameForSource.trim()
        : inferSourceNameFromUrl(sourceUrl);

    const row = {
      job: importConfig.job,
      role: importConfig.role,
      link: {
        name: importConfig.sourceName,
        url: linkUrl
      },
      source: {
        name: sourceName,
        url: sourceUrl
      },
      importedAt: importConfig.importedAt,
      updatedAt: importConfig.updatedAt,
      damage: { value: damageValue, type: damageType },
      ...infoByCategory
    };
    if (typeof finalNotes === "string" && finalNotes.trim().length > 0) {
      row.note = {
        text: finalNotes.trim()
      };
    }
    if (notesTooltip) {
      row.note = row.note ?? { text: rawName };
      row.note.tooltip = notesTooltip;
    }
    entries.push(row);
  }

  return entries;
}

function mergeEntries(existingEntries, newEntries, replaceExisting) {
  const next = [...existingEntries];
  let added = 0;
  let replaced = 0;
  let skipped = 0;

  const identityKey = (row) =>
    [
      row.job ?? "",
      row.content?.category ?? "",
      row.content?.kind ?? "",
      row.content?.value ?? "",
      row.link?.url ?? row.linkUrl ?? row.source?.url ?? row.sourceUrl ?? ""
    ].join("||");

  for (const row of newEntries) {
    const key = identityKey(row);
    const existingIndex = next.findIndex((entry) => identityKey(entry) === key);
    if (existingIndex === -1) {
      next.push(row);
      added += 1;
      continue;
    }

    if (replaceExisting) {
      next[existingIndex] = row;
      replaced += 1;
    } else {
      skipped += 1;
    }
  }

  return { entries: next, added, replaced, skipped };
}

function printHelp() {
  console.log(`Usage:
  npm run import:gear -- --config scripts/imports/my-batch.json [--dry-run]

Single import mode:
  npm run import:gear -- --url "<xivgear url>" --job DRK --category Savage --tier 7.4 [--role Tank] [--info "<name>"] [--updatedAt 2026-03-26] [--importedAt 2026-03-26]

Notes:
  - category-specific --info is required for: Ultimate, Criterion, Unreal, Other
  - role is optional for known jobs (derived automatically)
  - sim DPS can be supplied with config maps (simDpsByName/simDpsByIndex)`);
}

function buildSingleImportFromCli(args) {
  if (!args.url) {
    throw new Error("Single mode requires --url.");
  }
  return {
    url: args.url,
    job: args.job,
    role: args.role,
    category: args.category,
    tier: args.tier,
    info: args.info,
    importedAt: args.importedAt,
    updatedAt: args.updatedAt,
    sourceName: args.sourceName,
    replaceExisting: args.replaceExisting !== "false"
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const dataRaw = await fs.readFile(DATA_FILE_PATH, "utf8");
  const dataFile = JSON.parse(dataRaw);
  if (dataFile.schemaVersion !== 1) {
    dataFile.schemaVersion = 1;
  }
  if (!Array.isArray(dataFile.entries)) {
    throw new TypeError(`Data file ${DATA_FILE_PATH} has no entries array.`);
  }

  let imports;
  let defaults = {};
  if (typeof args.config === "string") {
    const configPath = path.resolve(args.config);
    const configRaw = await fs.readFile(configPath, "utf8");
    const parsed = JSON.parse(configRaw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Config root must be an object.");
    }
    defaults =
      parsed.defaults && typeof parsed.defaults === "object" && !Array.isArray(parsed.defaults)
        ? parsed.defaults
        : {};
    if (!Array.isArray(parsed.imports) || parsed.imports.length === 0) {
      throw new Error("Config requires a non-empty imports array.");
    }
    imports = parsed.imports;
  } else {
    imports = [buildSingleImportFromCli(args)];
  }

  let totalAdded = 0;
  let totalReplaced = 0;
  let totalSkipped = 0;
  const perImportSummary = [];

  for (const rawImport of imports) {
    const importConfig = normalizeImportConfig(rawImport, defaults);
    const resolved = await resolveSheetPayload(importConfig.url);
    importConfig._resolvedPageUrl = resolved.pageUrl;
    importConfig.autoSimDpsByIndex = {};
    importConfig.autoDamageTypeByIndex = {};
    if (!importConfig.skipSimDps) {
      const pageForSims = importConfig._resolvedPageUrl ?? normalizePageUrl(importConfig.url);
      if (pageForSims.startsWith("http")) {
        const extractedSims = await extractSimDpsFromRenderedPage(pageForSims);
        const normalizedSets = normalizePayloadSets(resolved.payload);
        const nonSeparatorIndexes = Array.isArray(normalizedSets)
          ? normalizedSets
              .map((set, index) => ({ set, index }))
              .filter(({ set }) => set && typeof set === "object" && !set.isSeparator)
              .map(({ index }) => index)
          : [];

        const autoMap = {};
        const autoTypeMap = {};
        const limit = Math.min(nonSeparatorIndexes.length, extractedSims.length);
        for (let idx = 0; idx < limit; idx += 1) {
          const setIndex = nonSeparatorIndexes[idx];
          const extracted = extractedSims[idx];
          const sim = toNumericLikeString(extracted?.value ?? extracted);
          if (sim) {
            autoMap[String(setIndex)] = sim;
            autoTypeMap[String(setIndex)] = classifyDamageTypeFromHeader(extracted?.type ?? "sim");
          }
        }
        importConfig.autoSimDpsByIndex = autoMap;
        importConfig.autoDamageTypeByIndex = autoTypeMap;
      }
    }

    const rows = buildEntriesFromSheet(resolved.payload, importConfig);
    const merged = mergeEntries(dataFile.entries, rows, importConfig.replaceExisting);
    dataFile.entries = merged.entries;

    totalAdded += merged.added;
    totalReplaced += merged.replaced;
    totalSkipped += merged.skipped;
    perImportSummary.push({
      url: importConfig.url,
      sourceDataUrl: resolved.dataUrl,
      generatedRows: rows.length,
      added: merged.added,
      replaced: merged.replaced,
      skipped: merged.skipped
    });
  }

  dataFile.lastUpdated = todayIsoDate();
  const serialized = `${JSON.stringify(dataFile, null, 2)}\n`;
  const dryRun = args["dry-run"] === true;
  if (!dryRun) {
    await fs.writeFile(DATA_FILE_PATH, serialized, "utf8");
  }

  for (const row of perImportSummary) {
    console.log(
      `- ${row.url}\n` +
        `  data: ${row.sourceDataUrl}\n` +
        `  rows: ${row.generatedRows} | added: ${row.added} | replaced: ${row.replaced} | skipped: ${row.skipped}`
    );
  }

  console.log("");
  console.log(
    `${dryRun ? "[dry-run] " : ""}Done. Added ${totalAdded}, replaced ${totalReplaced}, skipped ${totalSkipped}.`
  );
  console.log(`Data file: ${DATA_FILE_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
