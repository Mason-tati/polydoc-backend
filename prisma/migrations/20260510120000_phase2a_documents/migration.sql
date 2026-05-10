CREATE TYPE "DocumentStatus" AS ENUM (
  'UPLOADED',
  'EXTRACTED',
  'EXTRACTION_FAILED',
  'TRANSLATION_PENDING',
  'TRANSLATED',
  'FAILED'
);

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "originalName" TEXT NOT NULL,
  "storedName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "extractedPath" TEXT,
  "extractedText" TEXT,
  "sourceLanguage" TEXT,
  "targetLanguage" TEXT,
  "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

ALTER TABLE "Document"
ADD CONSTRAINT "Document_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
