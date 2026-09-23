import { useState } from "react";
import { Menu, Image as ImageIcon, List, Mic, Sparkles, Brain, UserCircle2 } from "lucide-react";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

interface HomeProps { onOpenMenu: () => void; onNavigate: (page: import("../types").AppPage) => void; }

export default function Home({ onOpenMenu, onNavigate }: HomeProps) {
  const { user } = useAuth();
  const { createChat, memoryEnabled, addMemory } = useApp();
  const [sent, setSent] = useState<string[]>([]);

  const handleSend = async (message: string) => {
    setSent(v => [...v, message]);
    await createChat(message.slice(0, 45));
  };

  const savePreference = async () => {
    if (memoryEnabled) await addMemory("User likes the WORLD AI workspace.");
  };

  return <div className="home">
    <header className="mobile-header">
      <button className="menu-button" onClick={onOpenMenu} aria-label="Open menu"><Menu size={25}/></button>
      <div className="mobile-brand">WORLD AI</div>
      <UserCircle2 size={24}/>
    </header>

    {sent.length > 0 && <section className="conversation-preview"><div className="preview-label">You</div><div className="preview-message">{sent[sent.length - 1]}</div><div className="preview-placeholder"><Sparkles size={18}/> AI response will connect in Phase 3</div></section>}

    <section className="feature-section">
      <button className="feature-card" onClick={() => onNavigate("images")}><div className="feature-icon"><ImageIcon size={30}/></div><div className="feature-title">Image Creation</div><div className="feature-description">Generate images from text</div></button>
      <button className="feature-card" onClick={() => onNavigate("code")}><div className="feature-icon"><List size={30}/></div><div className="feature-title">Code Builder</div><div className="feature-description">Write & debug code</div></button>
      <button className="feature-card" onClick={() => onNavigate("voice")}><div className="feature-icon"><Mic size={31}/></div><div className="feature-title">Voice AI</div><div className="feature-description">Transcribe & speak</div></button>
    </section>

    <section className="hero-section">
      <div className="hero-badge"><Sparkles size={15}/> Personal AI workspace</div>
      <h1>Hello, {user?.displayName?.split(" ")[0] || "there"}.<br/>What can I help with?</h1>
      <p>Your account, conversations and preferences are ready.</p>
      {memoryEnabled && <button className="memory-hint" onClick={() => void savePreference()}><Brain size={16}/> Memory is on</button>}
    </section>

    <section className="chat-section"><ChatInput onSend={handleSend}/><div className="bottom-placeholder"><span>WORLD AI • Your workspace</span></div></section>
  </div>;
}
