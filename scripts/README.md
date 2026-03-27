# Scripts

This directory contains helper scripts for importing and transforming BiS data.

## Maintained scripts (`scripts/tools/`)

- `tools/import-gearsets.mjs`
  - Main importer for XivGear sources into `public/data/bis-links.json`.
  - Supports config-file batch mode and single-URL mode.
  - Can auto-read Sim DPS from rendered tables when available.

- `tools/convert-etro-to-xivgear.mjs`
  - Converts Etro links into XivGear shortlinks (`?page=sl|...`).
  - Useful when you want sources to be consistently XivGear-based.

- `tools/build-xivgear-set-json.mjs`
  - Builds native XivGear import JSON payloads from spec files.

## Config files

- `imports.example.json`
  - Example batch config for `import-gearsets.mjs`.

- `imports/archive/*.json`
  - Historical one-off import batches used during data population.
  - Ignored by Git to keep the repo clean.

## Archived scripts (`scripts/archive/`)

- `archive/one-off/`
  - Historical one-off helpers retained for traceability.
- `archive/generated/`
  - Generated output JSON files.
- `archive/specs/`
  - Historical spec JSON files used to generate output.

## Generated artifacts

Files under `archive/generated/` and `archive/specs/` are intermediate/generated artifacts.
They are ignored by Git and can be regenerated as needed.

## Typical usage

Run from repository root:

```bash
npm run import:gear -- --config scripts/imports.example.json --dry-run
npm run import:gear -- --config scripts/imports.example.json
```
