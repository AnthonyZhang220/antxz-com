# Project Batch Import

This folder contains a Sanity-ready project batch import file.

## File
- `projects.ndjson`

## Import Command
Run from the repository root:

```bash
npx sanity dataset import sanity/import/projects.ndjson production --replace
```

If your dataset is not `production`, replace it with your dataset name.

## Notes
- The import file is aligned with `src/sanity/schemaTypes/project.ts`.
- Image fields (`coverImage`, `screenshots`) are intentionally omitted because old-site image paths are local asset paths, not uploaded Sanity assets.
- After importing, you can edit each project in Studio and upload cover/screenshot images.
- Imported documents include stable IDs (`project-*`) so re-importing with `--replace` updates the same records.
