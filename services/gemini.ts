
import { GoogleGenAI } from "@google/genai";

// Always use named parameter and direct process.env.API_KEY reference
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEA = async (code: string) => {
  try {
    // Using gemini-3-pro-preview for complex coding tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following MQL5 Expert Advisor code and provide a brief summary of its strategy, strengths, and potential risks. 

Code:
${code}`,
      config: {
        systemInstruction: "You are an expert MQL5 algorithmic trading developer. Provide concise, professional technical advice."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing EA code. Please check your API key.";
  }
};

export const chatWithExpert = async (message: string, code: string) => {
  try {
    // Using gemini-3-pro-preview for complex coding tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: This is an MQL5 EA bot based on Price Action and SHI Channels.
      
      User Question: ${message}
      
      EA Code for Reference:
      ${code}`,
      config: {
        systemInstruction: "You are an AI specialized in trading algorithms and MetaTrader 5 (MQL5). Help the user debug, refine, or understand their strategy."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Something went wrong in the transmission.";
  }
};
