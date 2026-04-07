import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API configuration error: GROQ_API_KEY is missing in Vercel environment.' });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are AI Saad Studio, a helpful AI assistant. Respond in Urdu, English, or Roman Urdu based on the user\'s language. Be friendly, helpful, and concise.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Response:", errorText);
      return res.status(response.status).json({ 
        error: 'AI service is temporarily unavailable.', 
        details: errorText 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response from AI.";
    
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Server Error:", error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
