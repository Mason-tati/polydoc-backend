const prisma = require("../db");
const { createTranslatedDocxBuffer } = require("../services/docxExport.service");
const { createTranslatedPdfBuffer } = require("../services/pdfExport.service");

function safeFilename(name) {
  return (name || "translated-manual")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

async function downloadTranslationDocx(req, res, next) {
  try {
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: {
            originalName: true,
          },
        },
      },
    });

    if (!translation) {
      return res.status(404).json({ error: "Translation not found." });
    }

    if (translation.status !== "COMPLETED" || !translation.translatedText) {
      return res.status(422).json({ error: "Translation is not ready for DOCX export." });
    }

    const buffer = await createTranslatedDocxBuffer({
      title: translation.document.originalName,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      translatedText: translation.translatedText,
    });

    const filename = `${safeFilename(translation.document.originalName)}-${translation.targetLanguage}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

async function downloadTranslationPdf(req, res, next) {
  try {
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id },
      include: { document: { select: { originalName: true } } },
    });
    if (!translation) return res.status(404).json({ error: "Translation not found." });
    if (translation.status !== "COMPLETED" || !translation.translatedText) {
      return res.status(422).json({ error: "Translation is not ready for PDF export." });
    }
    const buffer = await createTranslatedPdfBuffer({
      title: translation.document.originalName,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      translatedText: translation.translatedText,
    });
    const filename = `${safeFilename(translation.document.originalName)}-${translation.targetLanguage}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) { next(error); }
}

module.exports = {
  downloadTranslationDocx,
  downloadTranslationPdf,
};
