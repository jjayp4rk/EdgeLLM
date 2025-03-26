import { Message } from "../types";

export const cleanThinkBlocks = (text: string): string => {
  return text
    .replace(/<think>/g, "")
    .replace(/<\/think>/g, "")
    .trim();
};

export const formatConversationPrompt = (messages: Message[]): string => {
  return (
    messages
      .map((msg) => {
        if (msg.role === "system") {
          return `<|im_start|>system\n${msg.content}<|im_end|>\n`;
        } else if (msg.role === "user") {
          return `<|im_start|>user\n${msg.content}<|im_end|>\n`;
        } else {
          return `<|im_start|>assistant\n${msg.content}<|im_end|>\n`;
        }
      })
      .join("") + "<|im_start|>assistant\n"
  );
};
