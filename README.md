# TranslateManual.ai Backend - Phase 4B PDF Export

Phase 4B adds downloadable translated PDF export for completed translations.

## Endpoints

GET `/api/exports/translations/:id/docx`

GET `/api/exports/translations/:id/pdf`

## Test in browser

Replace `TRANSLATION_ID` with a completed translation ID:

```text
https://polydoc-backend-production.up.railway.app/api/exports/translations/TRANSLATION_ID/pdf
```

## Notes

This is professional MVP PDF export. It creates a clean translated PDF with headings, bullets, paragraphs, title, and footer. It does not yet perfectly preserve original PDF layout, images, or tables. That comes later in the advanced layout-preservation engine.

## Deploy

1. Copy these files into `polydoc-backend`
2. Commit: `Add Phase 4B PDF export`
3. Push origin
4. Railway redeploys backend
