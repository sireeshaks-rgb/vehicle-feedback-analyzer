import Groq from "groq-sdk";

// Define the Groq client only if the key is valid (not the placeholder)
const apiKeyEnv = process.env.GROQ_API_KEY;
const isValidKey = !!(apiKeyEnv && apiKeyEnv !== "your_groq_key_here" && !apiKeyEnv.startsWith("your_") && apiKeyEnv.length > 20);

// Use a type guard or cast to satisfy any strict compiler settings if the key is valid
export const groq = isValidKey ? new Groq({ apiKey: apiKeyEnv as string }) : null;

// The model to use — llama-3.3-70b-versatile is fast and high-quality
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function isGroqAvailable(): boolean {
    return isValidKey && groq !== null;
}
