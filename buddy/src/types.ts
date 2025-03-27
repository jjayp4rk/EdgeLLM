export type AppState = "welcome" | "downloading" | "chat" | "ready";

export interface Message {
  role: "user" | "assistant";
  content: string;
  thought?: string;
}
