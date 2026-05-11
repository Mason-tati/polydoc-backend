const prisma = require("../db");
const { extractTextFromFile, saveExtractedText } = require("../services/extractText.service");

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const doc = await prisma.document.create({
      data: {
        userId: req.user?.id || null,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        storagePath: req.file.path,
        status: "UPLOADED"
      }
    });

    try {
      const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
      const extractedPath = await saveExtractedText(doc.id, extractedText);

      const updated = await prisma.document.update({
        where: { id: doc.id },
        data: {
          extractedText,
          extractedPath,
          status: "EXTRACTED"
        }
      });

      return res.status(201).json({
        message: "Document uploaded and text extracted.",
        document: {
          id: updated.id,
          originalName: updated.originalName,
          mimeType: updated.mimeType,
          sizeBytes: updated.sizeBytes,
          status: updated.status,
          characterCount: extractedText.length,
          preview: extractedText.slice(0, 500)
        }
      });
    } catch (extractError) {
      const failed = await prisma.document.update({
        where: { id: doc.id },
        data: {
          status: "EXTRACTION_FAILED",
          errorMessage: extractError.message
        }
      });

      return res.status(422).json({
        message: "Document uploaded, but text extraction failed.",
        document: {
          id: failed.id,
          originalName: failed.originalName,
          status: failed.status,
          errorMessage: failed.errorMessage
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

async function listDocuments(req, res, next) {
  try {
    const documents = await prisma.document.findMany({
      where: req.user
        ? { userId: req.user.id }
        : undefined,

      orderBy: {
        createdAt: "desc"
      },

      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            translations: true
          }
        }
      }
    });

    res.json({
      documents
    });

  } catch (error) {
    next(error);
  }
}

async function getDocument(req, res, next) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (document && req.user && document.userId && document.userId !== req.user.id) {
      return res.status(403).json({ error: "You do not have access to this document." });
    }

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    res.json({
      document: {
        ...document,
        storagePath: undefined,
        extractedPath: undefined
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument
};
