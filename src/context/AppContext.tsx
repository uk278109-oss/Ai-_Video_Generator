import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, setDoc, serverTimestamp, where, type Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import type { Chat, MemoryItem, ThemeMode } from "../types";

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  memoryEnabled: boolean;
  setMemoryEnabled: (enabled: boolean) => Promise<void>;
  memories: MemoryItem[];
  addMemory: (text: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  clearMemories: () => Promise<void>;
  chats: Chat[];
  createChat: (title?: string) => Promise<string>;
  renameChat: (id: string, title: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function storageKey(uid: string, key: string) {
  return `world-ai:${uid}:${key}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [memoryEnabled, setMemoryEnabledState] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) {
      setThemeState("dark");
      setMemoryEnabledState(true);
      setMemories([]);
      setChats([]);
      return;
    }
    setThemeState((localStorage.getItem(storageKey(user.uid, "theme")) as ThemeMode) || "dark");
    setMemoryEnabledState(localStorage.getItem(storageKey(user.uid, "memoryEnabled")) !== "false");
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const actual = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    root.dataset.theme = actual;
  }, [theme]);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, snap => {
      setMemories(snap.docs.map(d => {
        const data = d.data();
        const created = data.createdAt as Timestamp | undefined;
        return { id: d.id, text: String(data.text || ""), createdAt: created?.toMillis() };
      }));
    });
  }, [user]);

  const refreshChats = async () => {
    if (!user || !db) return;
    const q = query(collection(db, "users", user.uid, "chats"), orderBy("updatedAt", "desc"), limit(50));
    const snap = await getDocs(q);
    setChats(snap.docs.map(d => {
      const data = d.data();
      const created = data.createdAt as Timestamp | undefined;
      const updated = data.updatedAt as Timestamp | undefined;
      return { id: d.id, title: String(data.title || "New chat"), createdAt: created?.toMillis() || Date.now(), updatedAt: updated?.toMillis() || Date.now() };
    }));
  };

  useEffect(() => { void refreshChats(); }, [user]);

  const setTheme = async (next: ThemeMode) => {
    setThemeState(next);
    if (user) localStorage.setItem(storageKey(user.uid, "theme"), next);
  };

  const setMemoryEnabled = async (enabled: boolean) => {
    setMemoryEnabledState(enabled);
    if (user) localStorage.setItem(storageKey(user.uid, "memoryEnabled"), String(enabled));
  };

  const addMemory = async (text: string) => {
    if (!user || !db || !text.trim()) return;
    const ref = doc(collection(db, "users", user.uid, "memories"));
    await setDoc(ref, { text: text.trim(), createdAt: serverTimestamp() });
  };

  const deleteMemory = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "memories", id));
  };

  const clearMemories = async () => {
    if (!user || !db) return;
    const snap = await getDocs(collection(db, "users", user.uid, "memories"));
    await Promise.all(snap.docs.map(item => deleteDoc(item.ref)));
  };

  const createChat = async (title = "New chat") => {
    if (!user || !db) return "";
    const ref = doc(collection(db, "users", user.uid, "chats"));
    await setDoc(ref, { title: title.trim() || "New chat", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await refreshChats();
    return ref.id;
  };

  const renameChat = async (id: string, title: string) => {
    if (!user || !db || !title.trim()) return;
    await setDoc(doc(db, "users", user.uid, "chats", id), { title: title.trim(), updatedAt: serverTimestamp() }, { merge: true });
    await refreshChats();
  };

  const deleteChat = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "chats", id));
    await refreshChats();
  };

  return <AppContext.Provider value={useMemo(() => ({
    theme, setTheme, memoryEnabled, setMemoryEnabled, memories, addMemory, deleteMemory, clearMemories,
    chats, createChat, renameChat, deleteChat, refreshChats
  }), [theme, memoryEnabled, memories, chats])}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
