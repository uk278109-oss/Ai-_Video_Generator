import { useState } from "react";
import { Plus, Mic, Send } from "lucide-react";

interface ChatInputProps { onSend: (message: string) => void; }

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const handleSend = () => { const trimmed = message.trim(); if (!trimmed) return; onSend(trimmed); setMessage(""); };
  return <div className="chat-input-wrapper">
    <button className="input-action" aria-label="Attach"><Plus size={21}/></button>
    <input value={message} placeholder="Ask WORLD AI" onChange={e => setMessage(e.target.value)} onKeyDown={e => { if(e.key === "Enter") { e.preventDefault(); handleSend(); }}} />
    <button className="input-action" aria-label="Voice"><Mic size={21}/></button>
    <button className="send-button" onClick={handleSend} aria-label="Send"><Send size={19}/></button>
  </div>;
}
