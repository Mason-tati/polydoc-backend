# TranslateManual.ai Backend — Phase 4A DOCX Export

Phase 4A adds downloadable Word document export for completed translations.

## New endpoint

GET `/api/exports/translations/:id/docx`

## Flow

1. Upload document
2. Translate document
3. Copy translation ID
4. Download DOCX:

```text
https://polydoc-backend-production.up.railway.app/api/exports/translations/TRANSLATION_ID/docx
```

## Deploy

1. Copy these files into `polydoc-backend`
2. Commit: `Add Phase 4A DOCX export`
3. Push origin
4. Railway redeploys backend
