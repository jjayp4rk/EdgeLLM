import { initLlama } from "llama.rn";
import RNFS from "react-native-fs";

let llamaContext: any = null;

export const setLlamaContext = (context: any) => {
  console.log("[LLM] Setting external context");
  llamaContext = context;
};

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const generateResponse = async (
  messages: Message[],
  context: any
): Promise<string> => {
  if (!context) {
    console.error("[LLM] No model context provided");
    throw new Error(
      "No model context provided. Please provide a valid model context."
    );
  }

  try {
    console.log("[LLM] Generating response for conversation:", messages);

    let currentResponse = "";
    const result = await context.completion(
      {
        messages: messages,
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
      },
      (data: { token: string }) => {
        if (data?.token) {
          currentResponse += data.token;
        }
      }
    );

    console.log("[LLM] Generated response:", currentResponse);
    return currentResponse.trim();
  } catch (error) {
    console.error("[LLM] Generation error:", error);
    throw error;
  }
};

export const initializeLLM = async (modelPath: string) => {
  try {
    console.log("[LLM] Initializing with model:", modelPath);
    llamaContext = await initLlama({
      model: modelPath,
      use_mlock: true,
      n_ctx: 2048,
      n_gpu_layers: 1,
    });
    console.log("[LLM] Initialization successful");
    return llamaContext;
  } catch (error) {
    console.error("[LLM] Initialization error:", error);
    throw error;
  }
};

export const cleanupLLM = () => {
  llamaContext = null;
};
