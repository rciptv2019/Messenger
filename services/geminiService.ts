
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async getSecurityAdvice(topic: string): Promise<string> {
    try {
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
      console.error("Gemini Error:", error);
      return "Always verify identities through a secondary out-of-band channel.";
    }
  }
};
