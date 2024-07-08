import { OLLAMA_BASE_URL } from './constants';
export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}
export async function getModels() {
  try {
    console.log(`${OLLAMA_BASE_URL}/api/tags`);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = (await response.json()) as { models: Model[] };

    // {"models": [{ "name": "llama2:latest","modified_at": "2023-10-28T17:51:44.867165975-07:00","size": 3825819519,"digest": "fe938a131f40e6f6d40083c9f0f430a515233eb2edaa6d72eb85c50d64f2300e"}]}

    return data.models;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
