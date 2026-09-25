import { useEffect, useMemo, useState } from "react";
import { Menu, Image as ImageIcon, Code2, Sparkles, Brain, UserCircle2, Copy, Check } from "lucide-react";
import DogLoader from "../components/DogLoader";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import type { AppPage, ChatMessage } from "../types";

interface HomeProps { onOpenMenu: () => void; onNavigate: (page: AppPage) => void; onOpenAccount: () => void; }

type RenderPart = { type: "text" | "code" | "heading"; value: string; lang?: string };
function formatMessage(content: string): RenderPart[] {
  const parts: RenderPart[] = []; const lines = content.split("\n"); let code = false; let lang = ""; let buffer: string[] = [];
  const flushCode = () => { if (buffer.length) { parts.push({ type: "code", value: buffer.join("\n"), lang }); buffer = []; } };
  let text: string[] = [];
  const flushText = () => { if (text.length) { parts.push({ type: "text", value: text.join("\n") }); text = []; } };
  for (const line of lines) {
    if (line.trim().startsWith("```") ) { if (!code) { flushText(); code = true; lang = line.trim().slice(3).trim(); } else { flushCode(); code = false; lang = ""; } continue; }
    if (code) { buffer.push(line); continue; }
    if (/^#{1,6}\s+/.test(line)) { flushText(); parts.push({ type: "heading", value: line.replace(/^#{1,6}\s+/, "") }); } else text.push(line);
  }
  code ? buffer.length && parts.push({ type: "code", value: buffer.join("\n"), lang }) : flushText();
  return parts.length ? parts : [{ type: "text", value: content }];
}

function MessageBody({ content }: { content: string }) {
  return <div className="rich-message">{formatMessage(content).map((part, i) => part.type === "code" ? <pre key={i} className="chat-code"><code>{part.value}</code></pre> : part.type === "heading" ? <h3 key={i}>{part.value}</h3> : <p key={i}>{part.value}</p>)}</div>;
}

export default function Home({ onOpenMenu, onNavigate, onOpenAccount }: HomeProps) {
  const { user } = useAuth();
  const { memoryEnabled, activeChatId, setActiveChatId, createChat, loadMessages, saveMessage } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [provider] = useState<"auto">("auto");

  useEffect(() => {
    let alive = true;
    if (!activeChatId) { setMessages([]); return; }
    void loadMessages(activeChatId).then(items => { if (alive) setMessages(items); });
    return () => { alive = false; };
  }, [activeChatId, loadMessages]);

  const handleSend = async (message: string) => {
    let chatId = activeChatId;
    if (!chatId) chatId = await createChat(message.slice(0, 45) || "New chat");
    if (!chatId) return;
    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
    const userMessage: ChatMessage = { id: `local-user-${Date.now()}`, role: "user", content: message, createdAt: Date.now() };
    setMessages(v => [...v, userMessage]); setLoading(true);
    await saveMessage(chatId, { role: "user", content: message });
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, provider, messages: [...history, { role: "user", content: message }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "DOG AI request failed.");
      const assistant = await saveMessage(chatId, { role: "assistant", content: String(data.text || "") });
      if (assistant) setMessages(v => [...v, assistant]);
    } catch (error) {
      const content = error instanceof Error ? error.message : "DOG AI request failed.";
      const assistant = await saveMessage(chatId, { role: "assistant", content });
      if (assistant) setMessages(v => [...v, assistant]);
    } finally { setLoading(false); }
  };

  const copy = async (id: string, content: string) => { try { await navigator.clipboard.writeText(content); setCopied(id); window.setTimeout(() => setCopied(null), 1400); } catch {} };
  const inChat = messages.length > 0 || loading;

  return <div className={`home ${inChat ? "chat-active" : "home-idle"}`}>
    <header className="mobile-header"><button className="menu-button" onClick={onOpenMenu} aria-label="Open menu"><Menu size={25}/></button><div className="mobile-brand">DOG AI</div><button className="mobile-profile-button" onClick={onOpenAccount} aria-label="Open account"><UserCircle2 size={25}/></button></header>

    {!inChat ? <>
      <section className="feature-section">
        <button className="feature-card compact-feature" onClick={() => onNavigate("code")}><div className="feature-icon"><Code2 size={27}/></div><div className="feature-title">Code Builder</div><div className="feature-description">Build, debug and improve code</div></button>
        <button className="feature-card compact-feature" onClick={() => onNavigate("images")}><div className="feature-icon"><ImageIcon size={27}/></div><div className="feature-title">Image Generation</div><div className="feature-description">Create images from a text prompt</div></button>
      </section>
      <section className="hero-section"><div className="hero-badge"><Sparkles size={15}/> Coding-first AI workspace</div><h1>Hello, {user?.displayName?.split(" ")[0] || "there"}.<br/>What are you building?</h1><p>Ask DOG AI for code, debugging help, architecture or ideas.</p>{memoryEnabled && <div className="memory-hint"><Brain size={16}/> Memory is on</div>}</section>
    </> : <section className="chat-tab"><div className="chat-tab-title"><span>Chat</span><small>DOG AI</small></div><div className="chat-messages">{messages.map(m => <article className={`chat-message ${m.role}`} key={m.id}><div className="chat-message-top"><strong>{m.role === "user" ? "You" : "DOG AI"}</strong>{m.role === "assistant" && <button onClick={() => void copy(m.id, m.content)} title="Copy response">{copied === m.id ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}</button>}</div><MessageBody content={m.content}/></article>)}{loading && <div className="ai-loading"><DogLoader size={34} label="DOG AI is thinking…" /></div>}</div></section>}

    <section className={`chat-section ${inChat ? "chat-section-active" : ""}`}><ChatInput onSend={handleSend} disabled={loading}/>{!inChat && <div className="bottom-placeholder"><span>DOG AI • Coding + Images</span></div>}</section>
  </div>;
}
