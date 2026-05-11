const fs = require("fs/promises");
const path = require("path");
const prisma = require("../db");
const { translateText } = require("../services/openaiTranslation.service");

async function translateDocument(req, res, next) {
  try {
    const { id } = req.params;
    const {
      targetLanguage,
      sourceLanguage = "auto",
      model
    } = req.body || {};

    if (!targetLanguage) {
      return res.status(400).json({ error: "targetLanguage is required." });
    }

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    if (req.user && document.userId && document.userId !== req.user.id) {
      return res.status(403).json({ error: "You do not have access to this document." });
    }

    if (!document.extractedText) {
      return res.status(422).json({
        error: "Document has no extracted text. Upload/extract must succeed before translation."
      });
    }

    const translation = await prisma.translation.create({
      data: {
        documentId: document.id,
        sourceLanguage,
        targetLanguage,
        status: "PROCESSING",
        originalChars: document.extractedText.length,
        model: model || process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini"
      }
    });

    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "TRANSLATING",
        sourceLanguage,
        targetLanguage
      }
    });

    try {
      const result = await translateText({
        text: document.extractedText,
        sourceLanguage,
        targetLanguage,
        model
      });

      const uploadRoot = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
      const translationsDir = path.join(uploadRoot, "translations");
      await fs.mkdir(translationsDir, { recursive: true });

      const translatedPath = path.join(
        translationsDir,
        `${translation.id}-${targetLanguage.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`
      );

      await fs.writeFile(translatedPath, result.translatedText, "utf8");

      const updatedTranslation = await prisma.translation.update({
        where: { id: translation.id },
        data: {
          status: "COMPLETED",
          translatedText: result.translatedText,
          translatedPath,
          translatedChars: result.translatedText.length,
          model: result.model
        }
      });

      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "TRANSLATED",
          sourceLanguage,
          targetLanguage
        }
      });

      return res.status(201).json({
        message: "Document translated successfully.",
        translation: {
          id: updatedTranslation.id,
          documentId: document.id,
          sourceLanguage,
          targetLanguage,
          status: updatedTranslation.status,
          model: updatedTranslation.model,
          originalChars: updatedTranslation.originalChars,
          translatedChars: updatedTranslation.translatedChars,
          preview: result.translatedText.slice(0, 800)
        }
      });
    } catch (translationError) {
      await prisma.translation.update({
        where: { id: translation.id },
        data: {
          status: "FAILED",
          errorMessage: translationError.message
        }
      });

      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "FAILED",
          errorMessage: translationError.message
        }
      });

      return res.status(500).json({
        error: "Translation failed.",
        message: translationError.message
      });
    }
  } catch (error) {
    next(error);
  }
}

async function listTranslations(req, res, next) {
  try {
    const { documentId } = req.query;

    const translations = await prisma.translation.findMany({
      where: {
        ...(documentId ? { documentId } : {}),
        ...(req.user ? { document: { userId: req.user.id } } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        documentId: true,
        sourceLanguage: true,
        targetLanguage: true,
        model: true,
        status: true,
        originalChars: true,
        translatedChars: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ translations });
  } catch (error) {
    next(error);
  }
}

async function getTranslation(req, res, next) {
  try {
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            status: true,
            userId: true
          }
        }
      }
    });

    if (!translation) {
      return res.status(404).json({ error: "Translation not found." });
    }

    if (req.user && translation.document && translation.document.userId && translation.document.userId !== req.user.id) {
      return res.status(403).json({ error: "You do not have access to this translation." });
    }

    res.json({
      translation: {
        ...translation,
        translatedPath: undefined
      }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadTranslation(req, res, next) {
  try {
    const translation = await prisma.translation.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: {
            originalName: true
          }
        }
      }
    });

    if (!translation) {
      return res.status(404).json({ error: "Translation not found." });
    }

    if (!translation.translatedText) {
      return res.status(422).json({ error: "Translation text is not available." });
    }

    const baseName = translation.document.originalName.replace(/\.[^.]+$/, "");
    const safeName = `${baseName}-${translation.targetLanguage}.txt`.replace(/[^a-zA-Z0-9._-]/g, "_");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.send(translation.translatedText);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  translateDocument,
  listTranslations,
  getTranslation,
  downloadTranslation
};
