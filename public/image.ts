export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, aspectRatio = '1:1' } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required.' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'Image generation needs GEMINI_API_KEY in Vercel Environment Variables.' });

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt.trim() }] }],
        generationConfig: { responseModalities: ['IMAGE'], responseFormat: { image: { aspectRatio } } },
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: data?.error?.message || `Image API returned ${response.status}` });
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const image = parts.find((part: any) => part?.inlineData?.data);
    if (!image) return res.status(502).json({ error: 'The image model returned no image.' });
    return res.status(200).json({ mimeType: image.inlineData.mimeType || 'image/png', data: image.inlineData.data });
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : 'Image generation failed.' });
  }
}
