import { useState } from "react";
import { Plus, Send } from "lucide-react";

interface ChatInputProps { onSend: (message: string) => void | Promise<void>; disabled?: boolean; placeholder?: string; }

export default function ChatInput({ onSend, disabled = false, placeholder = "Ask WORLD AI" }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const handleSend = async () => { const trimmed = message.trim(); if (!trimmed || disabled) return; setMessage(""); await onSend(trimmed); };
  return <div className="chat-input-wrapper">
    <button className="input-action" aria-label="Attach" title="Attach files (coming with file workspace)" onClick={() => alert("File workspace is being connected. You can use coding and image generation now.")}><Plus size={21}/></button>
    <input value={message} placeholder={placeholder} disabled={disabled} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if(e.key === "Enter") { e.preventDefault(); void handleSend(); }}} />
    <button className="send-button" onClick={() => void handleSend()} disabled={disabled || !message.trim()} aria-label="Send"><Send size={19}/></button>
  </div>;
}
