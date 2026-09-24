import { useRef, useState } from "react";
import { FileText, Plus, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled = false, placeholder = "Ask DOG AI" }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    setMessage("");
    await onSend(trimmed);
  };

  const handleFile = async (file?: File) => {
    if (!file || disabled) return;
    if (!file.type.startsWith("text/") && !/\.(md|mdx|json|js|jsx|ts|tsx|css|html|xml|py|java|kt|swift|sql|sh|yml|yaml|txt)$/i.test(file.name)) {
      setMessage(prev => `${prev}${prev ? "\n\n" : ""}[Attached file: ${file.name}]\nThis file type cannot be read directly in the browser.`);
      return;
    }
    try {
      const text = await file.text();
      const clipped = text.slice(0, 120000);
      setMessage(prev => `${prev}${prev ? "\n\n" : ""}[Attached: ${file.name}]\n\`\`\`\n${clipped}\n\`\`\``);
    } catch {
      setMessage(prev => `${prev}${prev ? "\n\n" : ""}[Could not read ${file.name}]`);
    }
  };

  return (
    <div className="chat-input-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".txt,.md,.mdx,.json,.js,.jsx,.ts,.tsx,.css,.html,.xml,.py,.java,.kt,.swift,.sql,.sh,.yml,.yaml,text/*"
        onChange={e => {
          void handleFile(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      <button
        className="input-action"
        aria-label="Attach a text or code file"
        title="Attach a text or code file"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus size={21} />
      </button>
      <input
        value={message}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
          }
        }}
      />
      <button className="send-button" onClick={() => void handleSend()} disabled={disabled || !message.trim()} aria-label="Send">
        <Send size={19} />
      </button>
    </div>
  );
        }
