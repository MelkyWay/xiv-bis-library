# XIV BiS Library

A lightweight Vue + TypeScript static site that centralizes Final Fantasy XIV BiS links.

## Stack
- Vue 3
- TypeScript
- Vite
- JSON data source (`public/data/bis-links.json`)

## Local development
```bash
npm install
npm run dev
```

## Docker
Development server:
```bash
docker compose up web-dev --build
```
Open `http://localhost:5173/xiv-bis-library/`.

Production preview:
```bash
docker compose up web-preview --build
```
Open `http://localhost:4173/xiv-bis-library/`.

Stop containers:
```bash
docker compose down
```

## Build
```bash
npm run build
npm run preview
```

## Gear Import Helper
Import XivGear sheet data into `public/data/bis-links.json`:

```bash
npm run import:gear -- --config scripts/imports.example.json --dry-run
npm run import:gear -- --config scripts/imports.example.json
```

Single URL mode:

```bash
npm run import:gear -- --url "https://xivgear.app/?page=bis|drk|current" --job DRK --category Savage --tier 7.4
```

Notes:
- For `Ultimate`, `Criterion`, `Unreal`, and `Other`, provide `info` (encounter/content name) in config or `--info` in single mode.
- `role` is optional for known jobs and is auto-derived.
- Sim DPS can be provided with `simDpsByName`, `simDpsByIndex`, or per-row `setOverrides`.
- The script dedupes on `sourceUrl` and can replace existing rows (`replaceExisting: true` by default).

## Etro To XivGear Converter
Convert Etro gearset links into saved XivGear shortlinks (`?page=sl|...`):

```bash
npm run convert:etro -- --url "https://etro.gg/gearset/<id>"
npm run convert:etro -- --input scripts/etro-urls.json --output scripts/etro-map.json
npm run convert:etro -- --from-data --update-data
```

Notes:
- `--input` accepts either a JSON array of URLs or `{ "urls": [...] }`.
- `--from-data` scans `sourceUrl` values in `public/data/bis-links.json` (or `--data <path>`).
- `--update-data` rewrites matching Etro links in the data file and sets `sourceName` to `XivGear`.
- The converter enforces at least one sim in the export. If no sim exists, it fails so you do not get links without sim DPS columns.

## Build Native XivGear Set JSON
Generate JSON that can be pasted directly into XivGear's Import page ("gear planner JSON"):

```bash
npm run build:xivgear-set -- --spec scripts/xivgear-set-spec.example.json --out scripts/out.mnk-sav-only.json
```

Optional:
- `--template <path>`: start from an exported XivGear JSON set to preserve sim/buff settings.
- `--materia-value 54`: pick materia by stat for a target value (defaults to `54`, i.e. XII for current tiers).

## Data model
Edit [public/data/bis-links.json](public/data/bis-links.json):
- `lastUpdated`: `YYYY-MM-DD`
- `entries[]`: one object per job/category link

Required fields per entry:
- `job`
- `role` (`Tank`, `Healer`, `Melee`, `Physical Ranged`, `Magical Ranged`, `Limited`)
- `category` (`Savage`, `Ultimate`, `Criterion`, `Prog`, `Other`)
- `tier` (format like `7.2`)
- `sourceName`
- `sourceUrl` (`http://` or `https://`)
- `updatedAt` (`YYYY-MM-DD`)

Optional field:
- `notes`

## GitHub Pages setup
1. Push this project to a GitHub repository.
2. In `vite.config.ts`, set `base` to your repo name (`/xiv-bis-library/` already set).
3. In GitHub: `Settings > Pages`, set `Source` to `GitHub Actions`.
4. Push to `main` to trigger `.github/workflows/deploy-pages.yml`.

## Next ideas
- Add multiple links per job by content type (Savage and Ultimate for same job).
- Archive older sets as needed.
- Add job icons and role grouping cards.
