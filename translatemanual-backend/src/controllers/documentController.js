const prisma = require('../config/prisma');
const { createDocument, translateDocument } = require('../services/documentService');

async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const document = await createDocument({
      userId: req.user.id,
      file: req.file,
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
    });
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

async function translate(req, res, next) {
  try {
    const document = await translateDocument({ documentId: req.params.id, userId: req.user.id });
    res.json(document);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const documents = await prisma.document.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        sourceLanguage: true,
        targetLanguage: true,
        status: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, translate, list, getOne };
