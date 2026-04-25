import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text || !sourceLang || !targetLang) {
      return Response.json(
        { error: "Missing required fields: text, sourceLang, targetLang" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
      systemInstruction: `You are a real-time interpreter. Translate the following text from ${sourceLang} to ${targetLang}. Retain cultural idioms and tone perfectly. ONLY reply with the translated text, no quotation marks, no markdown.`,
    });

    const translatedText = result.response.text().trim();

    return Response.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
