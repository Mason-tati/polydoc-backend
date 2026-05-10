# TranslateManual.ai Backend — Phase 2B

Phase 2B adds the AI Translation Engine.

## What is included

- Upload PDF, DOCX, TXT
- Extract text
- Translate extracted text with OpenAI
- Chunk long manuals
- Save translation jobs to PostgreSQL
- Download translated text file

## Required Railway Variables

```env
DATABASE_URL=your_railway_postgres_url
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

Optional:

```env
OPENAI_TRANSLATION_MODEL=gpt-4o-mini
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=26214400
```

Do not manually set PORT unless Railway asks. Server uses `process.env.PORT || 8080`.

## API

### Health

GET `/health`

### Upload Document

POST `/api/documents/upload`

Form-data:
- `file`: PDF, DOCX, or TXT

### List Documents

GET `/api/documents`

### Get Document

GET `/api/documents/:id`

### Translate Document

POST `/api/translations/documents/:id/translate`

JSON body:

```json
{
  "targetLanguage": "Indonesian",
  "sourceLanguage": "English"
}
```

### List Translations

GET `/api/translations`

GET `/api/translations?documentId=DOCUMENT_ID`

### Get Translation

GET `/api/translations/:id`

### Download Translation

GET `/api/translations/:id/download`

## Deploy

1. Copy files into your GitHub repo
2. Commit: `Add Phase 2B AI translation engine`
3. Push origin
4. Railway will redeploy and run migrations
