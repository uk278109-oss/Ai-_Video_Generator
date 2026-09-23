export type ThemeMode = "light" | "dark" | "world";
export type AppPage = "home" | "images" | "library" | "projects" | "scheduled" | "plugins" | "code" | "voice" | "account" | "pro";

export interface MemoryItem { id: string; text: string; createdAt?: number; }
export interface Chat { id: string; title: string; createdAt: number; updatedAt: number; }
