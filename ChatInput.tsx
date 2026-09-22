import { useState } from "react";
import { Plus, Mic, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <button className="input-action" aria-label="Attach"><Plus size={21} /></button>
      <input
        type="text"
        value={message}
        placeholder="Ask WORLD AI"
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="input-action" aria-label="Voice"><Mic size={21} /></button>
      <button className="send-button" onClick={handleSend} aria-label="Send">
        <Send size={19} />
      </button>
    </div>
  );
}

export default ChatInput;