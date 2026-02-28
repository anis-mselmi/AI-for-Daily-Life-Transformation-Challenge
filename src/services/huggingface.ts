import { HfInference } from '@huggingface/inference';

const HF_TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN || "";
const client = new HfInference(HF_TOKEN);

export const getHuggingFaceResponse = async (prompt: string) => {
  if (!HF_TOKEN) {
    throw new Error("Hugging Face Token is missing. Please add VITE_HUGGING_FACE_TOKEN to your .env file.");
  }

  const response = await client.chatCompletion({
    model: 'meta-llama/Llama-3.2-3B-Instruct',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "";
};

export const getHuggingFaceImage = async (prompt: string) => {
  if (!HF_TOKEN) throw new Error("HF Token missing");

  const response = await client.textToImage({
    model: 'black-forest-labs/FLUX.1-schnell',
    inputs: prompt,
  });

  return URL.createObjectURL(response as any);
};
