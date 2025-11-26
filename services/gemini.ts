import { GoogleGenAI, Type } from "@google/genai";
import { FixResponseSchema } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFix = async (problem: string): Promise<FixResponseSchema> => {
  const ai = getAiClient();
  
  const systemInstruction = `
    You are 'Instant Fix', a world-class life coach designed to provide immediate, high-impact guidance.
    Your tone is empathetic but direct, concise, and action-oriented.
    
    For every user problem, you must provide three distinct outputs:
    1. Insight: A profound 3-line advice snippet that shifts perspective. Max 3 sentences.
    2. Plan: A 30-second read plan explaining the strategy. Keep it punchy.
    3. Actions: Exactly 3 direct, immediate steps the user can take right now. Start with verbs.
    
    Do not use markdown formatting in the strings. Keep text clean.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: problem,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insight: {
            type: Type.STRING,
            description: "3-line advice: Short, practical insight.",
          },
          plan: {
            type: Type.STRING,
            description: "30-second plan: Quick strategy overview.",
          },
          actions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-step action list.",
          },
        },
        required: ["insight", "plan", "actions"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response received from AI");
  }

  try {
    return JSON.parse(response.text) as FixResponseSchema;
  } catch (error) {
    console.error("Failed to parse JSON response", error);
    throw new Error("Invalid response format from AI");
  }
};
