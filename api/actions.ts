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

    const prompt = `Extract any action items from the following note. An action item is a specific task for someone to do. Return a JSON object with an "action_items" key containing an array of strings. If there are no action items, the "action_items" array should be empty.\n\n---\n\n${content}`;

    const geminiResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action_items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of action items extracted from the text."
            }
          }
        },
      }
    });
    
    const jsonText = geminiResponse.text.trim();
    const parsed = JSON.parse(jsonText);
    return response.status(200).json({ action_items: parsed.action_items || [] });

  } catch (error) {
    console.error("Error extracting action items:", error);
    return response.status(500).json({ error: 'Failed to extract action items.' });
  }
}
