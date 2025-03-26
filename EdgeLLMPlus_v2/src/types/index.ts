export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string;
  showThought?: boolean;
};

export type ModelFormat = {
  label: string;
};

export type HF_TO_GGUF = {
  [key: string]: string;
};

export type CompletionData = {
  token: string;
};

export type CompletionResult = {
  timings: {
    predicted_per_second: number;
  };
};
