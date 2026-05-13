const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelsResult = await ai.models.list();
    for (const m of modelsResult.models) {
        if (m.supportedActions.includes('generateContent')) {
            console.log('Valid Model:', m.name);
        }
    }
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

test();
