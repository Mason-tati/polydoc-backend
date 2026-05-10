# TranslateManual.ai Backend

Node.js + Express + Prisma + PostgreSQL + OpenAI backend for TranslateManual.ai.

## Railway Variables

Required:

```env
DATABASE_URL=from Railway Postgres
OPENAI_API_KEY=your OpenAI key
JWT_SECRET=long random secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://translatemanual.ai
```

## Local Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## API

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/documents`
- `POST /api/documents/upload`
- `POST /api/documents/:id/translate`
- `GET /api/documents/:id`
