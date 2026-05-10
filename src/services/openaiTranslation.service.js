const OpenAI = require("openai");

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

function chunkText(text, maxChars = 9000) {
  const chunks = [];
  let remaining = text || "";

  while (remaining.length > maxChars) {
    let splitAt = remaining.lastIndexOf("\n\n", maxChars);
    if (splitAt < maxChars * 0.5) {
      splitAt = remaining.lastIndexOf(". ", maxChars);
    }
    if (splitAt < maxChars * 0.5) {
      splitAt = maxChars;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

function buildTranslationPrompt({ text, sourceLanguage, targetLanguage }) {
  return [
    {
      role: "system",
      content:
        "You are TranslateManual.ai, a specialist technical manual translator. Translate accurately, preserve headings, numbering, bullet structure, warnings, procedures, measurements, equipment names, and technical terms. Do not add commentary. Return only the translated manual text."
    },
    {
      role: "user",
      content:
        `Source language: ${sourceLanguage || "auto-detect"}\n` +
        `Target language: ${targetLanguage}\n\n` +
        "Translate the following technical manual content while preserving structure:\n\n" +
        text
    }
  ];
}

async function translateText({ text, sourceLanguage = "auto", targetLanguage, model }) {
  if (!targetLanguage) {
    throw new Error("targetLanguage is required.");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("No extracted text available to translate.");
  }

  const client = getOpenAIClient();
  const selectedModel = model || process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini";
  const chunks = chunkText(text);
  const translatedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: buildTranslationPrompt({
        text: chunks[i],
        sourceLanguage,
        targetLanguage
      }),
      temperature: 0.1
    });

    const translated = response.choices?.[0]?.message?.content?.trim();
    if (!translated) {
      throw new Error(`OpenAI returned empty translation for chunk ${i + 1}.`);
    }

    translatedChunks.push(translated);
  }

  return {
    model: selectedModel,
    translatedText: translatedChunks.join("\n\n"),
    chunkCount: chunks.length
  };
}

module.exports = {
  translateText,
  chunkText
};
