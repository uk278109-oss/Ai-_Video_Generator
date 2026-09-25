import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, setDoc, serverTimestamp, writeBatch, type Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import type { Chat, ChatMessage, MemoryItem, ThemeMode } from "../types";

interface AppContextValue {
  theme: ThemeMode; setTheme: (theme: ThemeMode) => Promise<void>;
  memoryEnabled: boolean; setMemoryEnabled: (enabled: boolean) => Promise<void>;
  memories: MemoryItem[]; addMemory: (text: string) => Promise<void>; deleteMemory: (id: string) => Promise<void>; clearMemories: () => Promise<void>;
  chats: Chat[]; activeChatId: string | null; setActiveChatId: (id: string | null) => void;
  createChat: (title?: string) => Promise<string>; renameChat: (id: string, title: string) => Promise<void>; deleteChat: (id: string) => Promise<void>; refreshChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<ChatMessage[]>; saveMessage: (chatId: string, message: Omit<ChatMessage, "id" | "createdAt">) => Promise<ChatMessage | null>;
}
const AppContext = createContext<AppContextValue | null>(null);
function storageKey(uid: string, key: string) { return `dog-ai:${uid}:${key}`; }

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [memoryEnabled, setMemoryEnabledState] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setThemeState("dark"); setMemoryEnabledState(true); setMemories([]); setChats([]); setActiveChatIdState(null); return; }
    setThemeState((localStorage.getItem(storageKey(user.uid, "theme")) as ThemeMode) || "dark");
    setMemoryEnabledState(localStorage.getItem(storageKey(user.uid, "memoryEnabled")) !== "false");
    setActiveChatIdState(localStorage.getItem(storageKey(user.uid, "activeChat")) || null);
  }, [user]);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, snap => setMemories(snap.docs.map(d => {
      const data = d.data(); const created = data.createdAt as Timestamp | undefined;
      return { id: d.id, text: String(data.text || ""), createdAt: created?.toMillis() };
    })));
  }, [user]);

  const refreshChats = async () => {
    if (!user || !db) return;
    const q = query(collection(db, "users", user.uid, "chats"), orderBy("updatedAt", "desc"), limit(50));
    const snap = await getDocs(q);
    setChats(snap.docs.map(d => {
      const data = d.data(); const created = data.createdAt as Timestamp | undefined; const updated = data.updatedAt as Timestamp | undefined;
      return { id: d.id, title: String(data.title || "New chat"), createdAt: created?.toMillis() || Date.now(), updatedAt: updated?.toMillis() || Date.now() };
    }));
  };
  useEffect(() => { void refreshChats(); }, [user]);

  const setActiveChatId = (id: string | null) => {
    setActiveChatIdState(id);
    if (user) { if (id) localStorage.setItem(storageKey(user.uid, "activeChat"), id); else localStorage.removeItem(storageKey(user.uid, "activeChat")); }
  };
  const setTheme = async (next: ThemeMode) => { setThemeState(next); if (user) localStorage.setItem(storageKey(user.uid, "theme"), next); };
  const setMemoryEnabled = async (enabled: boolean) => { setMemoryEnabledState(enabled); if (user) localStorage.setItem(storageKey(user.uid, "memoryEnabled"), String(enabled)); };
  const addMemory = async (text: string) => { if (!user || !db || !text.trim()) return; await setDoc(doc(collection(db, "users", user.uid, "memories")), { text: text.trim(), createdAt: serverTimestamp() }); };
  const deleteMemory = async (id: string) => { if (user && db) await deleteDoc(doc(db, "users", user.uid, "memories", id)); };
  const clearMemories = async () => { if (!user || !db) return; const snap = await getDocs(collection(db, "users", user.uid, "memories")); await Promise.all(snap.docs.map(item => deleteDoc(item.ref))); };

  const createChat = async (title = "New chat") => {
    if (!user || !db) return "";
    const ref = doc(collection(db, "users", user.uid, "chats"));
    await setDoc(ref, { title: title.trim() || "New chat", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    setActiveChatId(ref.id); await refreshChats(); return ref.id;
  };
  const renameChat = async (id: string, title: string) => { if (!user || !db || !title.trim()) return; await setDoc(doc(db, "users", user.uid, "chats", id), { title: title.trim(), updatedAt: serverTimestamp() }, { merge: true }); await refreshChats(); };
  const deleteChat = async (id: string) => {
    if (!user || !db) return;
    const messages = await getDocs(collection(db, "users", user.uid, "chats", id, "messages"));
    const batch = writeBatch(db); messages.docs.forEach(item => batch.delete(item.ref)); batch.delete(doc(db, "users", user.uid, "chats", id)); await batch.commit();
    if (activeChatId === id) setActiveChatId(null); await refreshChats();
  };
  const loadMessages = async (chatId: string) => {
    if (!user || !db) return [];
    const q = query(collection(db, "users", user.uid, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => { const data = d.data(); const created = data.createdAt as Timestamp | undefined; return { id: d.id, role: data.role === "assistant" ? "assistant" as const : "user" as const, content: String(data.content || ""), createdAt: created?.toMillis() || Date.now() }; });
  };
  const saveMessage = async (chatId: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
    if (!user || !db) return null;
    const ref = doc(collection(db, "users", user.uid, "chats", chatId, "messages"));
    const createdAt = Date.now();
    await setDoc(ref, { role: message.role, content: message.content, createdAt: serverTimestamp() });
    await setDoc(doc(db, "users", user.uid, "chats", chatId), { updatedAt: serverTimestamp() }, { merge: true });
    await refreshChats();
    return { id: ref.id, role: message.role, content: message.content, createdAt };
  };

  return <AppContext.Provider value={useMemo(() => ({ theme, setTheme, memoryEnabled, setMemoryEnabled, memories, addMemory, deleteMemory, clearMemories, chats, activeChatId, setActiveChatId, createChat, renameChat, deleteChat, refreshChats, loadMessages, saveMessage }), [theme, memoryEnabled, memories, chats, activeChatId])}>{children}</AppContext.Provider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("useApp must be used inside AppProvider"); return value; }
