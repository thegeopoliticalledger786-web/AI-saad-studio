import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = "AIzaSyCUZoji5Q4rC0R-xQYggS0rFNEI6QofsAE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `System: You are AI Saad Studio, a helpful AI assistant. Respond in Urdu, English, or Roman Urdu based on the user's language. Be friendly, helpful, and concise.\n\nUser: ${message}` }]
        }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Gemini API Error', details: errorText });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    
    return res.status(200).json({ reply });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
