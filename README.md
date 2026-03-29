# XIV BiS Library

A Vue 3 + TypeScript static site to centralize community BiS links for Final Fantasy XIV.

## Features
- Filters: Job, Role, Category, Encounter selector (Ultimate/Criterion/Unreal), Search
- Category-aware sorting and encounter ordering
- Damage column with sorting (`sim`, `potency`, and `none` types)
- Row actions: favorite toggle (stored in localStorage) and copy-link button
- URL query sync for shareable filtered links
- Light/Dark themes
- Localization support (English, French, German, Japanese, Korean, Chinese)
- GitHub Pages deployment workflow

## Tech Stack
- Vue 3
- TypeScript
- Vite
- JSON data source in `public/data/bis-links.json`

## Local Development
```bash
npm install
npm run dev
```
Default local URL: `http://localhost:5173/xiv-bis-library/`

## Build / Preview
```bash
npm run build
npm run preview
```

## Code Quality
```bash
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

CI (`.github/workflows/ci.yml`) runs `lint` + `build` on pushes and pull requests to `main`.

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

Stop:
```bash
docker compose down
```

## Data File
Main data file: `public/data/bis-links.json`

Top-level fields:
- `lastUpdated` (`YYYY-MM-DD`)
- `entries[]`
- optional name lists: `ultimateNames`, `criterionNames`, `unrealNames`

Per-entry fields:
- Required: `job`, `role`, `category`, `tier`, `link`, `source`, `updatedAt`
- `link` shape: `{ "name": "XivGear", "url": "https://..." }`
- `source` shape: `{ "name": "The Balance", "url": "https://..." }`
- Optional: `ultimate`, `criterionName`, `unrealName`, `otherName`, `notes`, `notesTooltip`, `damage`
- `damage` shape examples:
  - `{ "value": "12345.67", "type": "sim" }`
  - `{ "value": "12.34", "type": "potency" }`
  - `{ "value": "-", "type": "none" }`

Roles:
- `Tank`, `Healer`, `Melee`, `Physical Ranged`, `Magical Ranged`, `Limited`

Categories:
- `Savage`, `Prog`, `Ultimate`, `Criterion`, `Unreal`, `Occult Crescent`, `Other`

## Importing Gear Data
Use the importer to add/update rows from XivGear sheets:

```bash
npm run import:gear -- --config scripts/imports.example.json --dry-run
npm run import:gear -- --config scripts/imports.example.json
```

Single-import mode:
```bash
npm run import:gear -- --url "https://xivgear.app/?page=bis|drk|current" --job DRK --category Savage --tier 7.4
```

Notes:
- `Ultimate`, `Criterion`, `Unreal`, and `Other` require `info` (encounter/content name).
- `role` is auto-derived for known jobs if omitted.
- Damage values can be supplied manually (`simDpsByName`, `simDpsByIndex`, set overrides) or auto-read from rendered tables when available.
- Importer writes structured damage data to entries as `damage: { value, type }`.
- If no readable damage value is found, importer sets `damage` to `{ "value": "-", "type": "none" }`.
- Import dedupe identity is based on job/category/encounter/link URL and can replace existing rows.
- Script layout/details are documented in `scripts/README.md`.

## GitHub Pages
1. Ensure `vite.config.ts` `base` matches repository path (currently `/xiv-bis-library/`).
2. In GitHub repository settings, use Pages source: `GitHub Actions`.
3. Push to `main` to run `.github/workflows/deploy-pages.yml`.
