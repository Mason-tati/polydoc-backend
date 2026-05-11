# TranslateManual.ai Backend — Phase 5A Authentication

Phase 5A adds user accounts, JWT login, and protected document/translation APIs.

## New Auth APIs

POST `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Mason"
}
```

POST `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

GET `/api/auth/me`

Header:

```text
Authorization: Bearer TOKEN
```

## Protected APIs

These now require the Bearer token:

- POST `/api/documents/upload`
- GET `/api/documents`
- GET `/api/documents/:id`
- POST `/api/translations/documents/:id/translate`
- GET `/api/translations`
- GET `/api/translations/:id`
- GET `/api/exports/translations/:id/docx`
- GET `/api/exports/translations/:id/pdf`

## Railway Variables

Make sure this exists:

```env
JWT_SECRET=your-long-random-secret
```

## Deploy

1. Copy files into `polydoc-backend`
2. Commit: `Add Phase 5A authentication`
3. Push origin
4. Railway redeploys backend
