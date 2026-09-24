const SYSTEM = `You are DOG AI, a coding-first AI assistant. Be accurate, practical, concise and helpful. For programming requests, provide production-quality code, explain important decisions, and help debug errors. Never claim to have run code or accessed a user's files unless the app actually supplied them. When returning code, use fenced Markdown code blocks with the correct language when possible.`;

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function send(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

function cleanHistory(history: unknown): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string' && m.content.trim())
    .slice(-12)
    .map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content.trim() }],
    }));
}

async function callGemini(apiKey: string, model: string, message: string, history: unknown) {
  const contents = [
    ...cleanHistory(history),
    { role: 'user' as const, parts: [{ text: message.trim() }] },
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents,
      generationConfig: { temperature: 0.2 },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Gemini returned ${response.status}`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('').trim();
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

async function callGrok(apiKey: string, model: string, message: string, history: unknown) {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM },
    ...(Array.isArray(history)
      ? history.filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string' && m.content.trim()).slice(-12).map((m: any) => ({ role: m.role, content: m.content.trim() }))
      : []),
    { role: 'user', content: message.trim() },
  ];

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, stream: false, temperature: 0.2 }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Grok returned ${response.status}`);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Grok returned an empty response.');
  return text;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const { message, provider = 'auto', history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return send(res, 400, { error: 'Message is required.' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const xaiKey = process.env.XAI_API_KEY;
  const geminiModel = process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash';
  const grokModel = process.env.XAI_TEXT_MODEL || 'grok-4.7';

  const attempts: Array<'gemini' | 'grok'> =
    provider === 'gemini' ? ['gemini'] : provider === 'grok' ? ['grok'] : ['gemini', 'grok'];

  const errors: string[] = [];

  for (const selected of attempts) {
    try {
      if (selected === 'gemini' && geminiKey) {
        const text = await callGemini(geminiKey, geminiModel, message, history);
        return send(res, 200, { provider: 'gemini', text });
      }
      if (selected === 'grok' && xaiKey) {
        const text = await callGrok(xaiKey, grokModel, message, history);
        return send(res, 200, { provider: 'grok', text });
      }
      errors.push(`${selected} is not configured`);
    } catch (error) {
      errors.push(`${selected}: ${error instanceof Error ? error.message : 'request failed'}`);
    }
  }

  return send(res, 502, {
    error: errors.length
      ? `DOG AI could not get a response. ${errors.join(' | ')}`
      : 'No AI provider is configured. Add GEMINI_API_KEY or XAI_API_KEY in Vercel Environment Variables and redeploy.',
  });
}
