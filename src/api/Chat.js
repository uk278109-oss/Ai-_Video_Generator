const SYSTEM = `You are WORLD AI, a coding-first AI assistant. Be accurate, practical, concise and helpful. For programming requests, provide production-quality code, explain important decisions, and help debug errors. Never claim to have run code or accessed a user's files unless the app actually supplied them.`;

function send(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const { message, provider = 'auto', history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) return send(res, 400, { error: 'Message is required.' });

  const messages = [
    { role: 'system', content: SYSTEM },
    ...(Array.isArray(history) ? history.slice(-12).filter((m: any) => m?.role && typeof m?.content === 'string') : []),
    { role: 'user', content: message.trim() },
  ];

  const useGrok = provider === 'grok' || (provider === 'auto' && !process.env.GEMINI_API_KEY && !!process.env.XAI_API_KEY);
  const useGemini = provider === 'gemini' || (provider === 'auto' && !!process.env.GEMINI_API_KEY);

  try {
    if (useGemini && process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Gemini returned ${response.status}`);
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
      if (!text) throw new Error('Gemini returned an empty response.');
      return send(res, 200, { provider: 'gemini', text });
    }

    if (useGrok && process.env.XAI_API_KEY) {
      const model = process.env.XAI_TEXT_MODEL || 'grok-4.7';
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: JSON.stringify({ model, messages, stream: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Grok returned ${response.status}`);
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Grok returned an empty response.');
      return send(res, 200, { provider: 'grok', text });
    }

    return send(res, 503, { error: 'No AI provider is configured. Add GEMINI_API_KEY or XAI_API_KEY in Vercel Environment Variables and redeploy.' });
  } catch (error) {
    return send(res, 502, { error: error instanceof Error ? error.message : 'AI provider request failed.' });
  }
}
