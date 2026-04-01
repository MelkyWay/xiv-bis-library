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
  - `none` (`-`)
- Per-row actions: favorite toggle and copy link.

### Data source
- All displayed entries come from `public/data/bis-links.json`.
- This project does not require a backend database.

---

## Developer Guide

### Stack
- Vue 3
- TypeScript
- Vite
- JSON data (`public/data/bis-links.json`)

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
- `lastUpdated` (`YYYY-MM-DD`)
- `entries[]`
- optional name lists: `ultimateNames`, `criterionNames`, `unrealNames`

Per-entry fields:
- Required: `job`, `role`, `category`, `tier`, `link`, `source`, `updatedAt`
- `link`: `{ "name": "XivGear", "url": "https://..." }`
- `source`: `{ "name": "The Balance", "url": "https://..." }`
- Optional: `ultimate`, `criterionName`, `unrealName`, `otherName`, `notes`, `notesTooltip`, `damage`
- `damage` examples:
  - `{ "value": "12345.67", "type": "sim" }`
  - `{ "value": "12.34", "type": "potency" }`
  - `{ "value": "-", "type": "none" }`

Roles:
- `Tank`, `Healer`, `Melee`, `Physical Ranged`, `Magical Ranged`, `Limited`

Categories:
- `Savage`, `Prog`, `Ultimate`, `Criterion`, `Unreal`, `Occult Crescent`, `Eureka`, `Other`

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
- If no readable damage is found, importer sets `{ "value": "-", "type": "none" }`.
- Dedupe identity is based on job/category/encounter/link URL.
- More script details: `scripts/README.md`.

### GitHub Pages
1. Ensure `vite.config.ts` `base` matches repo path (`/xiv-bis-library/` currently).
2. In GitHub settings, set Pages source to `GitHub Actions`.
3. Push to `main` to run `.github/workflows/deploy-pages.yml`.
