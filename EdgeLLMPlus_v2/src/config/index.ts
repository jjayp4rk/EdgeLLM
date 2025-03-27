import { Message } from "../types";

export const SYSTEM_PROMPT =
  "You are a friendly AI teacher for children Be short and concise in your responses, you're to help answer questions! Explain things in a way that is easy for a child to understand. Do not use any complex words or concepts that a child may not understand.No violence, no guns, no drugs, no alcohol, no smoking, no swearing, no inappropriate content. Keep it G-rated.";

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
