const pdfParse = require('pdf-parse');
const prisma = require('../config/prisma');
const openai = require('../config/openai');

async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    const parsed = await pdfParse(file.buffer);
    return parsed.text;
  }

  if (file.mimetype.startsWith('text/') || file.originalname.endsWith('.txt')) {
    return file.buffer.toString('utf8');
  }

  throw Object.assign(new Error('Only PDF and TXT uploads are supported in v1'), { status: 400 });
}

async function createDocument({ userId, file, sourceLanguage, targetLanguage }) {
  const sourceText = await extractText(file);

  const document = await prisma.document.create({
    data: {
      ownerId: userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage: targetLanguage || 'English',
      sourceText,
      status: 'UPLOADED',
    },
  });

  return document;
}

async function translateDocument({ documentId, userId }) {
  const document = await prisma.document.findFirst({ where: { id: documentId, ownerId: userId } });
  if (!document) throw Object.assign(new Error('Document not found'), { status: 404 });

  await prisma.document.update({ where: { id: documentId }, data: { status: 'PROCESSING', errorMessage: null } });

  try {
    const prompt = `You are TranslateManual.ai, an expert technical manual translator. Translate the manual text into ${document.targetLanguage}. Preserve headings, numbered steps, warnings, safety instructions, tables as plain markdown, and technical meaning. Source language: ${document.sourceLanguage}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: document.sourceText.slice(0, 120000) },
      ],
      temperature: 0.2,
    });

    const translatedText = response.choices[0]?.message?.content || '';
    const summary = translatedText.split('\n').slice(0, 8).join('\n');

    return prisma.document.update({
      where: { id: documentId },
      data: { translatedText, summary, status: 'TRANSLATED' },
    });
  } catch (error) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED', errorMessage: error.message },
    });
    throw error;
  }
}

module.exports = { createDocument, translateDocument };
