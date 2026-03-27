import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const setsJson = await fs.readFile('scripts/out-uwu-sets-array.json', 'utf8');

const openSheetMenu = async (page) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const code = 8801;
    const buttons = Array.from(document.querySelectorAll('button'));
    const matches = buttons.filter((b) => {
      const t = (b.textContent || '').trim();
      return t.length === 1 && t.charCodeAt(0) === code;
    });
    const target = matches[2] || matches[matches.length - 1];
    if (!target) throw new Error('Sheet menu button not found');
    target.click();
  });
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto('https://xivgear.app/?page=newsheet', { waitUntil: 'domcontentloaded' });

  const acceptBtn = page.getByRole('button', { name: 'Accept' });
  if (await acceptBtn.isVisible().catch(() => false)) await acceptBtn.click().catch(() => {});

  await page.getByRole('button', { name: 'MNK' }).click();
  await page.getByRole('textbox', { name: 'Sheet Name:' }).fill("The Weapon's Refrain");
  await page.getByRole('combobox', { name: 'Level:' }).selectOption('70');

  const syncCheckbox = page.getByRole('checkbox', { name: 'Sync Item Level' });
  if (!(await syncCheckbox.isChecked())) await syncCheckbox.click();

  const textboxes = page.locator('input[type="text"]');
  const count = await textboxes.count();
  await textboxes.nth(count - 1).fill('375');

  await page.getByRole('button', { name: 'New Sheet' }).click();
  await page.waitForURL(/\?page=sheet\|/, { timeout: 120000 });

  await openSheetMenu(page);
  await page.getByRole('button', { name: 'Import Sets' }).click();
  await page.locator('textarea').first().fill(setsJson);
  await page.locator('import-set-dialog').getByRole('button', { name: 'Import' }).click();

  await page.getByText('Relic (20-23 STR)').waitFor({ timeout: 120000 });
  await page.getByText('Relic (19 STR)').waitFor({ timeout: 120000 });
  await page.getByText('Non-Relic').waitFor({ timeout: 120000 });
  await page.getByText('Lazy').waitFor({ timeout: 120000 });

  await page.evaluate(() => {
    const sheet = window.currentSheet;
    const defaults = sheet._sets.filter((s) => s.name === 'Default Set');
    for (const d of defaults) sheet.delGearSet(d, false);
    sheet.level = 70;
    sheet.ilvlSync = 375;
    sheet.requestSave?.();
    sheet.refreshToolbar?.();
    sheet._gearPlanTable?.dataChanged?.();
  });

  await openSheetMenu(page);
  await page.getByRole('button', { name: 'Export Sheet' }).click();
  await page.locator('sheet-export-modal').getByRole('radio', { name: 'Link to Whole Sheet' }).check();
  await page.locator('sheet-export-modal').getByRole('button', { name: 'Generate' }).click();

  const link = await page.locator('sheet-export-modal textarea').inputValue();
  const summary = await page.evaluate(() => ({
    level: window.currentSheet.level,
    ilvlSync: window.currentSheet.ilvlSync,
    sets: window.currentSheet._sets.map((s) => s.name)
  }));

  console.log(JSON.stringify({ link, summary }, null, 2));
} finally {
  await browser.close();
}
