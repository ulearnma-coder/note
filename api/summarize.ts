import { GoogleGenAI } from "@google/genai";

// This file is a serverless function. It runs on the server, not in the browser.
// It can safely use the API key from environment variables.
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

    const prompt = `Summarize the following note content concisely. Provide the summary in a single paragraph.\n\n---\n\n${content}`;
    
    const geminiResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    const summary = geminiResponse.text.trim();
    return response.status(200).json({ summary });

  } catch (error) {
    console.error("Error in summarize function:", error);
    return response.status(500).json({ error: 'Failed to generate summary.' });
  }
}
