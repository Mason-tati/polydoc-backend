DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'TRANSLATING'
    AND enumtypid = '"DocumentStatus"'::regtype
  ) THEN
    ALTER TYPE "DocumentStatus" ADD VALUE 'TRANSLATING';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TranslationStatus') THEN
    CREATE TYPE "TranslationStatus" AS ENUM (
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Translation" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "sourceLanguage" TEXT NOT NULL DEFAULT 'auto',
  "targetLanguage" TEXT NOT NULL,
  "model" TEXT,
  "status" "TranslationStatus" NOT NULL DEFAULT 'PENDING',
  "originalChars" INTEGER NOT NULL DEFAULT 0,
  "translatedChars" INTEGER NOT NULL DEFAULT 0,
  "translatedText" TEXT,
  "translatedPath" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Translation_documentId_idx" ON "Translation"("documentId");
CREATE INDEX IF NOT EXISTS "Translation_status_idx" ON "Translation"("status");
CREATE INDEX IF NOT EXISTS "Translation_createdAt_idx" ON "Translation"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Translation_documentId_fkey'
  ) THEN
    ALTER TABLE "Translation"
    ADD CONSTRAINT "Translation_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "Document"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
