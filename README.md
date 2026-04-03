# XIV BiS Library

A Vue 3 + TypeScript site that centralizes community BiS links for Final Fantasy XIV.

## User Guide

### What this site does
- Centralizes BiS links by job, role, category, and encounter.
- Lets you filter quickly and share filtered views through URL query sync.
- Supports favorites (saved in your browser), copy-link actions, and light/dark themes.
- Supports localization: English, French, German, Japanese, Korean, Chinese.

### Main features
- Filters: Job, Role, Category, encounter selector (Ultimate/Criterion/Unreal), and free-text search.
- Category-aware ordering and encounter-aware ordering.
- Damage column with sortable structured values:
  - `sim`
  - `potency`
  - `none` (stored as `null`, displayed as `-`)
- Per-row actions: favorite toggle and copy link.

### Data source
- All displayed entries come from `public/data/bis-links.json`.
- This project does not require a backend database.

### Contributing
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the suggested workflow for new sets, broken links, stale data reports, and i18n issues.

---

## Developer Guide

### Stack
- Vue 3
- TypeScript
- Vite
- JSON data (`public/data/bis-links.json`)

### Contribution Templates
- GitHub issue forms live in `.github/ISSUE_TEMPLATE/`.
- The localized copies are generated from shared source templates by `npm run generate:issue-templates`.
- Supported localized outputs are English, French, German, Japanese, Korean, Simplified Chinese, and Traditional Chinese.
- `CONTRIBUTING.md` is the contributor-facing guide; the template generation details stay here for project development and maintenance notes.

### Local development
```bash
npm install
npm run dev
```
Default URL: `http://localhost:5173/xiv-bis-library/`

### Build and preview
```bash
npm run build
npm run preview
```

### Testing and quality
```bash
npm run test
npm run test:watch
npm run test:coverage
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

CI (`.github/workflows/ci.yml`) runs:
- `lint`
- `test:coverage`
- `build`

### Docker
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

### Data schema
Main data file: `public/data/bis-links.json`

Top-level fields:
- `schemaVersion` (`1`)
- `lastUpdated` (`YYYY-MM-DD`)
- `entries[]`

Per-entry fields:
- Required: `job`, `role`, `content`, `link`, `source`, `importedAt`, `updatedAt`
- `content`: `{ "category": "...", "kind": "tier" | "encounter", "value": "..." }`
  - Example tier entry: `{ "category": "Savage", "kind": "tier", "value": "7.4" }`
  - Example encounter entry: `{ "category": "Ultimate", "kind": "encounter", "value": "The Unending Coil of Bahamut" }`
- `link`: `{ "name": "XivGear", "url": "https://..." }`
- `source`: `{ "name": "The Balance", "url": "https://..." }`
- Optional: `note`, `damage`
- `note` example:
  - `{ "text": "2.50 GCD", "tooltip": "Optional context shown on hover." }`
- `damage` examples:
  - `{ "value": 12345.67, "type": "sim" }`
  - `{ "value": 12.34, "type": "potency" }`
  - `{ "value": null, "type": "none" }`
- Date semantics:
  - `importedAt`: date this row was ingested into this library.
  - `updatedAt`: freshness date for the referenced external set data.

Roles:
- `Tank`, `Healer`, `Melee`, `Physical Ranged`, `Magical Ranged`, `Limited`

Categories:
- `Savage`, `Prog`, `Ultimate`, `Criterion`, `Unreal`, `Occult Crescent`, `Other`

Category source of truth:
- Edit `src/config/categories.json`.
- `src/config/categories.generated.ts` is auto-generated from JSON by `npm run generate:categories`.

### Importing gear data
Config mode:
```bash
npm run import:gear -- --config scripts/imports.example.json --dry-run
npm run import:gear -- --config scripts/imports.example.json
```

Single-import mode:
```bash
npm run import:gear -- --url "https://xivgear.app/?page=bis|drk|current" --job DRK --category Savage --tier 7.4
```

Notes:
- `Ultimate`, `Criterion`, `Unreal`, and `Other` require `info`.
- `role` can be auto-derived for known jobs.
- Damage can be provided manually or auto-read when available.
- Importer writes `damage: { value, type }`.
- Importer writes `importedAt` (defaults to `updatedAt` if omitted).
- If no readable damage is found, importer sets `{ "value": null, "type": "none" }`.
- Dedupe identity is based on job/content/category+kind+value/link URL.
- More script details: `scripts/README.md`.

### GitHub Pages
1. Ensure `vite.config.ts` `base` matches repo path (`/xiv-bis-library/` currently).
2. In GitHub settings, set Pages source to `GitHub Actions`.
3. Push to `main` to run `.github/workflows/deploy-pages.yml`.
