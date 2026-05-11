const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} = require("docx");

function isHeading(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 120) return false;
  if (/^[A-Z0-9 .:/()\-]+$/.test(trimmed) && trimmed.length > 5) return true;
  if (/^(section|chapter|part|appendix|warning|caution|note)\b/i.test(trimmed)) return true;
  return false;
}

function isBullet(line) {
  return /^\s*(-|•|\*|\d+\.|[a-zA-Z]\))\s+/.test(line);
}

function cleanBullet(line) {
  return line.replace(/^\s*(-|•|\*|\d+\.|[a-zA-Z]\))\s+/, "").trim();
}

function buildParagraphs(text) {
  const lines = (text || "").split("\n");
  const paragraphs = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      continue;
    }

    if (/^---PAGE BREAK---$/i.test(line)) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    if (isHeading(line)) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      continue;
    }

    if (isBullet(line)) {
      paragraphs.push(
        new Paragraph({
          text: cleanBullet(line),
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
      continue;
    }

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }

  return paragraphs;
}

async function createTranslatedDocxBuffer({ title, sourceLanguage, targetLanguage, translatedText }) {
  const doc = new Document({
    creator: "TranslateManual.ai",
    title: title || "Translated Manual",
    description: "AI translated technical manual",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: title || "Translated Manual",
                bold: true,
                size: 34,
              }),
            ],
            spacing: { after: 240 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Source: ${sourceLanguage || "auto"}  |  Target: ${targetLanguage}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 360 },
          }),
          ...buildParagraphs(translatedText),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = {
  createTranslatedDocxBuffer,
};
