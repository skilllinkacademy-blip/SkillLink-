import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SmartMatchAnalysis {
  score: number;
  explanation: string;
  pros: string[];
  cons: string[];
  advice: string;
}

export async function analyzeMatch(opportunity: any, profile: any, isRtl: boolean): Promise<SmartMatchAnalysis | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const prompt = `
      Analyze the match between a user profile and a job/apprenticeship opportunity.
      
      USER PROFILE:
      - Name: ${profile.full_name}
      - Occupation: ${profile.occupation}
      - Location: ${profile.location}
      - Bio: ${profile.bio}
      - Learning Intent: ${profile.learningIntent}
      
      OPPORTUNITY:
      - Title: ${opportunity.title}
      - Trade: ${opportunity.trade}
      - Location: ${opportunity.location}
      - Description: ${opportunity.about_work || opportunity.description}
      - Requirements: ${opportunity.requirements}
      
      Provide the analysis in ${isRtl ? 'Hebrew' : 'English'}.
      Focus on semantic relevance, skills overlap, and geographic proximity.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Match score from 0 to 100" },
            explanation: { type: Type.STRING, description: "Short summary of the match" },
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key match points" },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential gaps or distance issues" },
            advice: { type: Type.STRING, description: "Advice for the user" }
          },
          required: ["score", "explanation", "pros", "cons", "advice"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
}
