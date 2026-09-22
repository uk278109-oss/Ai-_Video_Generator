import { useState } from "react";
import { X, Search, Images, Library, FolderKanban, Clock3, Puzzle, Square, Plus, Settings, LogOut, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

interface SidebarProps { open: boolean; onClose: () => void; onSettings: () => void; }

export default function Sidebar({ open, onClose, onSettings }: SidebarProps) {
  const { user, signOutUser } = useAuth();
  const { chats, createChat, renameChat, deleteChat } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const newChat = async () => { await createChat(); onClose(); };
  const visible = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
    <div className="sidebar-top"><button className="brand-button" onClick={() => void newChat()}>WORLD AI</button><button className="close-sidebar" onClick={onClose}><X size={22}/></button></div>
    <button className="new-chat-button" onClick={() => void newChat()}><Plus size={18}/> New chat</button>
    <div className="sidebar-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats"/></div>
    <nav className="navigation">
      <button><MessageSquare size={20}/><span>Chats</span></button>
      <button><Images size={20}/><span>Images</span></button>
      <button><Library size={20}/><span>Library</span></button>
      <button><FolderKanban size={20}/><span>Projects</span></button>
      <button><Clock3 size={20}/><span>Scheduled</span></button>
      <button><Puzzle size={20}/><span>Tools</span></button>
    </nav>
    <div className="sidebar-divider" />
    <div className="recents-title">Your chats</div>
    <div className="recent-list">
      {visible.length === 0 ? <div className="sidebar-empty">No chats yet</div> : visible.map(chat => <div className="recent-item" key={chat.id}>
        <Square size={17}/>
        {editing === chat.id ? <input autoFocus defaultValue={chat.title} className="rename-input" onBlur={async e => { await renameChat(chat.id, e.target.value); setEditing(null); }} onKeyDown={async e => { if(e.key === "Enter") { await renameChat(chat.id, e.currentTarget.value); setEditing(null); } }} /> :
        <button className="recent-title-button"><strong>{chat.title}</strong><small>{new Date(chat.updatedAt).toLocaleDateString()}</small></button>}
        <span className="chat-actions"><button onClick={() => setEditing(chat.id)} title="Rename"><Pencil size={14}/></button><button onClick={() => void deleteChat(chat.id)} title="Delete"><Trash2 size={14}/></button></span>
      </div>)}
    </div>
    <div className="sidebar-bottom">
      <button className="profile-button"><span className="avatar-small">{(user?.displayName || user?.email || "U").slice(0,1).toUpperCase()}</span><span className="profile-copy"><strong>{user?.displayName || "My account"}</strong><small>{user?.email}</small></span></button>
      <button className="sidebar-setting" onClick={onSettings}><Settings size={18}/><span>Settings</span></button>
      <button className="sidebar-setting danger" onClick={() => void signOutUser()}><LogOut size={18}/><span>Log out</span></button>
    </div>
  </aside>;
}
