import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { ThemeMode } from "../types";

interface SettingsProps { open: boolean; onClose: () => void; }

export default function Settings({ open, onClose }: SettingsProps) {
  const { theme, setTheme, memoryEnabled, setMemoryEnabled, memories, deleteMemory, clearMemories } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState<"appearance" | "memory" | "account">("appearance");

  if (!open) return null;

  return (
    <div className="settings-backdrop" onMouseDown={onClose}>
      <section className="settings-panel" onMouseDown={e => e.stopPropagation()}>
        <header className="settings-header"><div><span className="eyebrow">Preferences</span><h2>Settings</h2></div><button className="icon-button" onClick={onClose}><X size={20}/></button></header>
        <div className="settings-body">
          <nav className="settings-tabs">
            <button className={tab === "appearance" ? "active" : ""} onClick={() => setTab("appearance")}>Appearance</button>
            <button className={tab === "memory" ? "active" : ""} onClick={() => setTab("memory")}>Memory</button>
            <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>Account</button>
          </nav>
          <div className="settings-content">
            {tab === "appearance" && <Appearance theme={theme} setTheme={setTheme} />}
            {tab === "memory" && <Memory memoryEnabled={memoryEnabled} setMemoryEnabled={setMemoryEnabled} memories={memories} deleteMemory={deleteMemory} clearMemories={clearMemories} />}
            {tab === "account" && <Account userEmail={user?.email || ""} displayName={user?.displayName || "WORLD AI user"} />}
          </div>
        </div>
      </section>
    </div>
  );
}

function Appearance({ theme, setTheme }: { theme: ThemeMode; setTheme: (v: ThemeMode) => Promise<void> }) {
  const options: { value: ThemeMode; title: string; text: string }[] = [
    { value: "light", title: "Light", text: "Bright workspace" },
    { value: "dark", title: "Dark", text: "Low-light workspace" },
    { value: "system", title: "System", text: "Follow your device" }
  ];
  return <div className="settings-section"><h3>Theme</h3><p>Choose how WORLD AI looks on this device.</p><div className="theme-options">{options.map(option => <button key={option.value} className={`theme-option ${theme === option.value ? "selected" : ""}`} onClick={() => void setTheme(option.value)}><span className={`theme-preview ${option.value}`} /><span><strong>{option.title}</strong><small>{option.text}</small></span>{theme === option.value && <Check size={18}/>}</button>)}</div></div>;
}

function Memory({ memoryEnabled, setMemoryEnabled, memories, deleteMemory, clearMemories }: { memoryEnabled: boolean; setMemoryEnabled: (v: boolean) => Promise<void>; memories: {id:string;text:string}[]; deleteMemory: (id:string)=>Promise<void>; clearMemories: ()=>Promise<void> }) {
  const [clearing, setClearing] = useState(false);
  const clear = async () => { if (!memories.length || !window.confirm("Clear all saved memories?")) return; setClearing(true); try { await clearMemories(); } finally { setClearing(false); } };
  return <div className="settings-section"><div className="setting-row"><div><h3>Memory</h3><p>Allow WORLD AI to use saved preferences in future conversations.</p></div><button className={`toggle ${memoryEnabled ? "on" : ""}`} onClick={() => void setMemoryEnabled(!memoryEnabled)} aria-label="Toggle memory"><span /></button></div><div className="memory-list"><div className="list-heading"><strong>Saved memories</strong><button onClick={() => void clear()} disabled={clearing || !memories.length}><Trash2 size={16}/> {clearing ? "Clearing…" : "Clear all"}</button></div>{memories.length === 0 ? <div className="empty-state">No saved memories yet.</div> : memories.map(memory => <div className="memory-item" key={memory.id}><span>{memory.text}</span><button onClick={() => void deleteMemory(memory.id)} aria-label="Delete memory"><Trash2 size={16}/></button></div>)}</div></div>;
}

function Account({ userEmail, displayName }: { userEmail: string; displayName: string }) {
  return <div className="settings-section"><h3>Account</h3><p>Your WORLD AI account details.</p><div className="account-box"><div className="avatar">{displayName.slice(0,1).toUpperCase()}</div><div><strong>{displayName}</strong><span>{userEmail}</span></div></div><p className="muted-note">Authentication is handled by Firebase. Password reset and additional providers can be added in the next phase.</p></div>;
}
