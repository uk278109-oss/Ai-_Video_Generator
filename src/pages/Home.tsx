import { useState } from "react";
import { Menu, Image as ImageIcon, Code2, Sparkles, Brain, UserCircle2, Loader2 } from "lucide-react";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import type { AppPage } from "../types";

interface HomeProps { onOpenMenu: () => void; onNavigate: (page: AppPage) => void; onOpenAccount: () => void; }
type Msg = { role: "user" | "assistant"; content: string; provider?: string };

export default function Home({ onOpenMenu, onNavigate, onOpenAccount }: HomeProps) {
  const { user } = useAuth();
  const { createChat, memoryEnabled } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"auto"|"gemini"|"grok">("auto");

  const handleSend = async (message: string) => {
    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
    setMessages(v => [...v, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, provider, history }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "AI request failed.");
      setMessages(v => [...v, { role: "assistant", content: data.text, provider: data.provider }]);
      await createChat(message.slice(0, 45));
    } catch (error) {
      setMessages(v => [...v, { role: "assistant", content: error instanceof Error ? error.message : "AI request failed." }]);
    } finally { setLoading(false); }
  };

  return <div className="home">
    <header className="mobile-header">
      <button className="menu-button" onClick={onOpenMenu} aria-label="Open menu"><Menu size={25}/></button>
      <div className="mobile-brand">WORLD AI</div>
      <button className="mobile-profile-button" onClick={onOpenAccount} aria-label="Open account"><UserCircle2 size={25}/></button>
    </header>

    {messages.length > 0 && <section className="conversation-preview">
      {messages.map((m, i) => <div className={`message-bubble ${m.role}`} key={i}><div className="preview-label">{m.role === "user" ? "You" : `WORLD AI${m.provider ? ` • ${m.provider}` : ""}`}</div><div className="preview-message">{m.content}</div></div>)}
      {loading && <div className="ai-loading"><Loader2 size={17} className="spin"/> WORLD AI is thinking…</div>}
    </section>}

    <section className="feature-section">
      <button className="feature-card" onClick={() => onNavigate("images")}><div className="feature-icon"><ImageIcon size={30}/></div><div className="feature-title">Image Creation</div><div className="feature-description">Generate images from text</div></button>
      <button className="feature-card" onClick={() => onNavigate("code")}><div className="feature-icon"><Code2 size={30}/></div><div className="feature-title">Code Builder</div><div className="feature-description">Build, debug and improve code</div></button>
    </section>

    <section className="hero-section">
      <div className="hero-badge"><Sparkles size={15}/> Coding-first AI workspace</div>
      <h1>Hello, {user?.displayName?.split(" ")[0] || "there"}.<br/>What are you building?</h1>
      <p>Ask WORLD AI for code, debugging help, architecture or ideas.</p>
      <div className="ai-model-row"><span>Model</span><select value={provider} onChange={e => setProvider(e.target.value as typeof provider)}><option value="auto">Auto</option><option value="gemini">Gemini</option><option value="grok">Grok</option></select></div>
      {memoryEnabled && <div className="memory-hint"><Brain size={16}/> Memory is on</div>}
    </section>

    <section className="chat-section"><ChatInput onSend={handleSend} disabled={loading}/><div className="bottom-placeholder"><span>WORLD AI • Coding + Images</span></div></section>
  </div>;
}
