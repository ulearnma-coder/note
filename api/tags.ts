import { GoogleGenAI, Type } from "@google/genai";

// FIX: Use process.env.API_KEY per coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }
  
  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return response.status(400).json({ error: 'Content is required.' });
    }

    const prompt = `Analyze the following note content and suggest up to 5 relevant tags. Return a JSON object with a "tags" key containing an array of strings. Examples: "work", "project-alpha", "ideas", "urgent". Base tags on the key topics and entities mentioned.\n\n---\n\n${content}`;

    const geminiResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
      }
    });

    const jsonText = geminiResponse.text.trim();
    const parsed = JSON.parse(jsonText);
    return response.status(200).json({ tags: parsed.tags || [] });

  } catch (error) {
    console.error("Error suggesting tags:", error);
    return response.status(500).json({ error: 'Failed to generate tags.' });
  }
}
