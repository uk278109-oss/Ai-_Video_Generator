import { useState } from "react";
import { Menu, Image as ImageIcon, List, Mic, Sparkles, Brain, UserCircle2 } from "lucide-react";
import FeatureCard from "../components/FeatureCard";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

interface HomeProps { onOpenMenu: () => void; }

export default function Home({ onOpenMenu }: HomeProps) {
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
      <FeatureCard icon={<ImageIcon size={30}/>} title="Image Creation" description="Generate images from text" />
      <FeatureCard icon={<List size={30}/>} title="Code Builder" description="Write & debug code" />
      <FeatureCard icon={<Mic size={31}/>} title="Voice AI" description="Transcribe & speak" />
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
