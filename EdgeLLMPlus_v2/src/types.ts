export type AppState = "welcome" | "downloading" | "ready" | "modelSelection";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  thought?: string;
}
