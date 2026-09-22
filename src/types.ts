export type ThemeMode = "light" | "dark" | "system";

export interface MemoryItem {
  id: string;
  text: string;
  createdAt?: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}
