import { Message } from "../types";

export const SYSTEM_PROMPT =
  "You are a friendly AI for kids. Give short, simple answers. Avoid big words or complex ideas. Stick to safe, kid-friendly topics. No violence, guns, drugs, alcohol, or swearing. Keep everything G-rated. Please be very friendly and warm, and answers should always be short and concise! Long answers are only allowed if the user asks for them.";

export const INITIAL_CONVERSATION: Message[] = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

export const MODEL_CONFIG = {
  FILE: "SmolLM2-1.7B-Instruct-IQ4_XS_imat.gguf",
  REPO: "medmekk/SmolLM2-1.7B-Instruct.GGUF",
  URL: `https://huggingface.co/medmekk/SmolLM2-1.7B-Instruct.GGUF/resolve/main/SmolLM2-1.7B-Instruct-IQ4_XS_imat.gguf`,
};

export const LLM_CONFIG = {
  n_predict: 400,
  stop: [
    "</s>",
    "<|end|>",
    "user:",
    "assistant:",
    "<|im_end|>",
    "<|eot_id|>",
    "<|end▁of▁sentence|>",
    "<|end_of_text|>",
    "REDACTED_SPECIAL_TOKEN",
  ],
  temperature: 0.8,
  repeat_penalty: 1.2,
  top_k: 40,
  top_p: 0.9,
  n_ctx: 2048,
  presence_penalty: 0.6,
  frequency_penalty: 0.6,
};
