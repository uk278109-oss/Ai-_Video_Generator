import AsyncStorage from '@react-native-async-storage/async-storage';

const CODE_KEY = 'firstai_code_v1';
const CHAT_KEY = 'firstai_chat_v1';
const APIKEY_KEY = 'firstai_apikey_v1';

export async function loadCode() {
  try {
    const raw = await AsyncStorage.getItem(CODE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore, fall back to defaults
  }
  return {
    html: '<h1>Welcome to FirstAI</h1>\n<p>Tell your mentor what to build, and watch it appear here.</p>\n<button id="demoBtn">Click me</button>',
    css: 'body{font-family:sans-serif;text-align:center;padding:40px 20px;background:#f4f4f7;color:#222;}\nbutton{padding:10px 18px;border:none;border-radius:8px;background:#7DD3FC;color:#0B1D33;font-weight:700;}',
    js: "document.getElementById('demoBtn').addEventListener('click', function(){\n  alert('JavaScript is working!');\n});",
  };
}

export async function saveCode(code) {
  try {
    await AsyncStorage.setItem(CODE_KEY, JSON.stringify(code));
  } catch (e) {
    // storage full or unavailable - safe to ignore for this app
  }
}

export async function loadChat() {
  try {
    const raw = await AsyncStorage.getItem(CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export async function saveChat(history) {
  try {
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(history));
  } catch (e) {}
}

export async function loadApiKey() {
  try {
    return (await AsyncStorage.getItem(APIKEY_KEY)) || '';
  } catch (e) {
    return '';
  }
}

export async function saveApiKey(key) {
  try {
    await AsyncStorage.setItem(APIKEY_KEY, key || '');
  } catch (e) {}
}
