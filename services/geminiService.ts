
import { GoogleGenAI } from "@google/genai";

// Función para obtener la instancia de IA de forma segura
const getAI = () => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async getSecurityAdvice(topic: string): Promise<string> {
    try {
      const ai = getAI();
      if (!ai) throw new Error("No API Key");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a concise, expert security tip about ${topic} for a privacy-focused messaging app user. Keep it under 60 words.`,
        config: {
          systemInstruction: "You are a cyber-security expert specialized in zero-trust architecture and anonymous communications.",
          temperature: 0.7,
        }
      });
      return response.text || "Keep your shared keys offline and never reuse them across different contacts.";
    } catch (error) {
      // Fallback silencioso si no hay API Key o falla el servicio
      return "Always verify identities through a secondary out-of-band channel.";
    }
  }
};
