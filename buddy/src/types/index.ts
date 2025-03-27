export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  thought?: string;
  showThought?: boolean;
}

export type AppState = "welcome" | "downloading" | "ready";
