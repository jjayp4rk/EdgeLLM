export type AppState = "welcome" | "downloading" | "chat" | "ready";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string;
}
