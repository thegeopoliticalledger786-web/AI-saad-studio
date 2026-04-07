import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ai-saad-studio.vercel.app', // Optional, for OpenRouter analytics
        'X-Title': 'AI Saad Studio', // Optional, for OpenRouter analytics
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5', // Using a reliable model via OpenRouter
        messages: [
          {
            role: 'system',
            content: 'You are AI Saad Studio, a helpful AI assistant. Respond in Urdu, English, or Roman Urdu based on the user\'s language. Be friendly, helpful, and concise.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error Response:", errorText);
      return res.status(response.status).json({ 
        error: 'AI is currently unavailable. Please check your OpenRouter credits or API key.', 
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
