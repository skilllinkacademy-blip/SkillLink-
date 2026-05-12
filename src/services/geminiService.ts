import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: any = null;

function getAI() {
  if (aiInstance) return aiInstance;
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn("VITE_GEMINI_API_KEY is not defined.");
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e);
    return null;
  }
}

const MODEL_NAME = "gemini-2.5-flash";

export interface SmartMatchAnalysis {
  score: number;
  explanation: string;
  pros: string[];
  cons: string[];
  advice: string;
}

export async function analyzeMatch(opportunity: any, profile: any, isRtl: boolean): Promise<SmartMatchAnalysis | null> {
  try {
    const ai = getAI();
    if (!ai) return null;

    const prompt = `
      Analyze the match between a user profile and a job/apprenticeship opportunity.

      USER PROFILE:
      - Name: ${profile.full_name || profile.name}
      - Occupation: ${profile.occupation || profile.trade}
      - Location: ${profile.location}
      - Bio: ${profile.bio}

      OPPORTUNITY:
      - Title: ${opportunity.title}
      - Trade: ${opportunity.trade || opportunity.profession}
      - Location: ${opportunity.location}
      - Description: ${opportunity.about_work || opportunity.description || opportunity.aboutWork}

      Provide the analysis in ${isRtl ? 'Hebrew' : 'English'}.
      Focus on semantic relevance, skills overlap, and geographic proximity.
      Return as JSON object with score (0-100), explanation, pros (array), cons (array), advice.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING }
          },
          required: ["score", "explanation", "pros", "cons", "advice"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as SmartMatchAnalysis;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
}

export async function getAIChatResponse(messages: { role: 'user' | 'model', content: string }[], isRtl: boolean) {
  try {
    const ai = getAI();
    if (!ai) return isRtl ? "מצטער, חלה שגיאה בחיבור ל-AI." : "Sorry, I'm having trouble connecting to the AI services.";

    const systemPrompt = `
      You are SkillLink AI Assistant, a helpful assistant for the SkillLink platform.
      SkillLink connects professional mentors with apprentices for hands-on training in trades.
      Respond in ${isRtl ? 'Hebrew' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: isRtl ? "הבנתי, אני מוכן לעזור." : "Understood, I am ready to help." }] },
        ...messages.map((m: any) => ({
          role: m.role || 'user',
          parts: [{ text: m.content || m.text }]
        }))
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return isRtl ? "מצטער, חלה שגיאה בחיבור ל-AI." : "Sorry, I'm having trouble connecting to the AI services.";
  }
}
