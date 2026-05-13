const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const content = 'Hello, reply with "Gemini works!"';
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [content],
    });
    console.log('Gemini Response:', response.text);
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

test();
