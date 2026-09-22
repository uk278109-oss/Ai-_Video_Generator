// FirstAI talks to Groq's free API by default (https://console.groq.com).
// Groq's chat endpoint is OpenAI-compatible, so swapping providers later
// (e.g. to OpenAI, or any other OpenAI-compatible free host) only means
// changing API_URL and MODEL below - the rest of the app stays the same.

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Sends the conversation to the AI and returns its reply as plain text.
 * @param {string} apiKey - the user's free Groq API key
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 */
export async function askMentor(apiKey, messages) {
  if (!apiKey) {
    throw new Error('No API key set. Open Settings and paste your free Groq API key.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('AI request failed (' + response.status + '): ' + text.slice(0, 200));
  }

  const data = await response.json();
  const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply) throw new Error('AI returned an empty response, please try again.');
  return reply;
}

export function buildSystemPrompt(code) {
  return (
    'You are FirstAI, a friendly expert coding mentor helping a complete beginner build a small web app ' +
    'through conversation, one step at a time. You have access to the current state of their project ' +
    '(HTML/CSS/JS) below. When the user asks you to build or change something, respond with a short, warm ' +
    'explanation (2-4 sentences, plain English, no jargon) of what you did, followed by the COMPLETE updated ' +
    'file content for any file you changed, each in its own fenced code block labeled html, css, or js ' +
    '(e.g. ```html ... ```). Only include files you actually changed. Never use diffs or partial snippets - ' +
    'always the full file content. If the user is just asking a question and no code needs to change, reply ' +
    'with plain text and no code blocks.\n\n' +
    'Current project state:\nHTML:\n' + code.html + '\n\nCSS:\n' + code.css + '\n\nJS:\n' + code.js
  );
}

// Parses an AI reply into { prose, blocks: [{lang, code}] }
export function parseReply(text) {
  const codeRe = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let prose = '';
  const blocks = [];
  while ((match = codeRe.exec(text)) !== null) {
    prose += text.slice(lastIndex, match.index);
    const tag = (match[1] || '').toLowerCase();
    let lang = null;
    if (tag.indexOf('html') > -1) lang = 'html';
    else if (tag.indexOf('css') > -1) lang = 'css';
    else if (tag.indexOf('js') > -1 || tag.indexOf('javascript') > -1) lang = 'js';
    blocks.push({ lang, code: match[2].trim() });
    lastIndex = codeRe.lastIndex;
  }
  prose += text.slice(lastIndex);
  return { prose: prose.trim(), blocks };
}
