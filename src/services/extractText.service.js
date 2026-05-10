const fs = require("fs/promises");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return normalizeText(data.text || "");
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ path: filePath });
    return normalizeText(result.value || "");
  }

  if (mimeType === "text/plain") {
    const text = await fs.readFile(filePath, "utf8");
    return normalizeText(text);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function saveExtractedText(documentId, text) {
  const uploadRoot = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  const extractedDir = path.join(uploadRoot, "extracted");
  await fs.mkdir(extractedDir, { recursive: true });

  const extractedPath = path.join(extractedDir, `${documentId}.txt`);
  await fs.writeFile(extractedPath, text, "utf8");

  return extractedPath;
}

module.exports = {
  extractTextFromFile,
  saveExtractedText
};
