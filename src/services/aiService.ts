import { GoogleGenAI, Type } from "@google/genai";

// Standard Israeli City Coordinates (Approximate)
const CITY_COORDS: Record<string, [number, number]> = {
  'תל אביב': [32.0853, 34.7818],
  'ירושלים': [31.7683, 35.2137],
  'חיפה': [32.7940, 34.9896],
  'באר שבע': [31.2520, 34.7915],
  'פתח תקווה': [32.0840, 34.8878],
  'ראשון לציון': [31.9730, 34.7925],
  'נתניה': [32.3215, 34.8532],
  'אשדוד': [31.8044, 34.6553],
  'חולון': [32.0158, 34.7874],
  'בני ברק': [32.0837, 34.8312],
  'רמת גן': [32.0684, 34.8248],
  'רחובות': [31.8928, 34.8113],
  'הרצליה': [32.1660, 34.8433],
  'כפר סבא': [32.1750, 34.9069],
  'חדרה': [32.4340, 34.9197],
  'מודיעין': [31.8903, 35.0104],
  'רעננה': [32.1848, 34.8713],
  'בית שמש': [31.7470, 34.9881],
  'לוד': [31.9510, 34.8932],
  'רמלה': [31.9272, 34.8624],
};

function calculateDistance(coord1: [number, number], coord2: [number, number]) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getAIOpportunityRecommendations(userProfile: any, opportunities: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Falling back to basic scoring.');
    return basicOpportunityScoring(userProfile, opportunities);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Heuristic filtering for performance: take top 20 based on basic scoring first
  const candidates = Array.isArray(opportunities) ? basicOpportunityScoring(userProfile, opportunities).slice(0, 20) : [];

  if (candidates.length === 0) return [];

  const prompt = `
    You are a highly sophisticated recruitment AI for "SkillLink", an Israeli marketplace for professional mentorships and artisanal apprenticeships.
    Your goal is to match users with opportunities.
    
    CRITICAL INSTRUCTIONS:
    1. BE EXTREMELY STRICT. If an opportunity does not match the user's trade (occupation) or professional goals, give it a score BELOW 30%.
    2. High scores (80%+) are reserved ONLY for exact trade matches in the same or nearby city.
    3. If the user provided nonsense data, assign VERY LOW scores (0-15%) to everything.
    4. Provide a "reason" in Hebrew (1 professional sentence) that actually justifies the match logic.
    
    User Profile:
    - Name: ${userProfile.full_name}
    - Role: ${userProfile.role}
    - Trade/Occupation: ${userProfile.occupation}
    - Skills: ${userProfile.skills || 'Not specified'}
    - Goals: ${userProfile.bio || 'Not specified'}
    - Location: ${userProfile.location}
    
    Candidates:
    ${candidates.map((o, i) => `
      - ID: ${o.id}
        Title: ${o.title}
        Trade: ${o.trade || o.ownerTrade}
        Location: ${o.location}
        Description: ${o.about_work || o.aboutWork || o.learningFocus}
    `).join('\n')}
    
    Return a JSON array: [{"id": number, "score": number, "reason": string}].
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["id", "score", "reason"]
          }
        }
      }
    });

    const aiOutput = JSON.parse(response.text);
    
    // Merge AI results with candidate data
    return candidates.map(opp => {
      const aiRec = aiOutput.find((r: any) => r.id === opp.id);
      return {
        ...opp,
        matchScore: aiRec?.score || 10,
        aiReason: aiRec?.reason || (userProfile.isRtl ? 'התאמה נמוכה על סמך הפרטים.' : 'Low match based on details.')
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

  } catch (error) {
    console.error('AI Matching Error:', error);
    return candidates; 
  }
}

export async function getAIProfileRecommendations(userProfile: any, profiles: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    return basicProfileScoring(userProfile, profiles);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const candidates = Array.isArray(profiles) ? basicProfileScoring(userProfile, profiles).slice(0, 20) : [];

  if (candidates.length === 0) return [];

  const prompt = `
    You are a professional Israeli mentorship AI for "SkillLink".
    Compare the current user's profile with a list of potential mentors/apprentices.
    Find the best professional matches.
    
    CRITICAL: 
    - Same trade (occupation) matches are GOLD (90%+).
    - If user is "mentee", find "mentor" in same trade.
    - If user is "mentor", find "mentee" in same trade.
    - Be strict. If no professional connection, score below 20%.

    User Profile:
    - Name: ${userProfile.full_name}
    - Trade: ${userProfile.occupation}
    - Role: ${userProfile.role}
    - Bio: ${userProfile.bio}

    Candidates:
    ${candidates.map(p => `
      - ID: ${p.id}
        Name: ${p.full_name}
        Trade: ${p.occupation}
        Role: ${p.role}
        Bio: ${p.bio}
    `).join('\n')}

    Return JSON array: [{"id": number, "score": number, "reason": string}]. Reason in Hebrew.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["id", "score", "reason"]
          }
        }
      }
    });

    const aiOutput = JSON.parse(response.text);
    return candidates.map(p => {
      const rec = aiOutput.find((r: any) => r.id === p.id);
      return { ...p, aiScore: rec?.score || 10, aiReason: rec?.reason };
    }).sort((a, b) => b.aiScore - a.aiScore);
  } catch (error) {
    console.error('Profile AI Error:', error);
    return candidates;
  }
}

function basicOpportunityScoring(userProfile: any, opportunities: any[]) {
  if (!Array.isArray(opportunities)) return [];
  const userLatLon = CITY_COORDS[userProfile.location] || [32.0853, 34.7818];
  
  return opportunities.map(opp => {
    let score = 10;
    
    // Trade match - strong signal
    const userTrade = (userProfile.occupation || '').toLowerCase();
    const oppTrade = (opp.trade || opp.ownerTrade || '').toLowerCase();
    const oppTitle = (opp.title || '').toLowerCase();
    
    if (userTrade && (oppTrade.includes(userTrade) || oppTrade === userTrade || oppTitle.includes(userTrade))) {
      score += 50;
    }
    
    // Location match
    const oppLatLon = CITY_COORDS[opp.location] || [32.0853, 34.7818];
    const distance = calculateDistance(userLatLon, oppLatLon);
    
    if (distance < 10) score += 20;
    else if (distance < 30) score += 10;
    
    // Role complementarity
    if (userProfile.role === 'mentor' && opp.type === 'mentee_seeking') score += 15;
    if (userProfile.role === 'mentee' && opp.type === 'mentor_offer') score += 15;
    
    return { 
      ...opp, 
      matchScore: Math.min(100, score),
      distance: Math.round(distance)
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

function basicProfileScoring(userProfile: any, profiles: any[]) {
  if (!Array.isArray(profiles)) return [];
  const userLatLon = CITY_COORDS[userProfile.location] || [32.0853, 34.7818];
  
  return profiles.map(p => {
    let score = 10;
    const userTrade = (userProfile.occupation || '').toLowerCase();
    const pTrade = (p.occupation || '').toLowerCase();
    
    if (userTrade && pTrade && (pTrade.includes(userTrade) || userTrade.includes(pTrade))) {
      score += 50;
    }
    
    const pLatLon = CITY_COORDS[p.location] || [32.0853, 34.7818];
    const distance = calculateDistance(userLatLon, pLatLon);
    if (distance < 20) score += 20;

    // Role match
    if (userProfile.role === 'mentee' && p.role === 'mentor') score += 15;
    if (userProfile.role === 'mentor' && p.role === 'mentee') score += 15;

    return { ...p, basicScore: Math.min(100, score), distance: Math.round(distance) };
  }).sort((a, b) => b.basicScore - a.basicScore);
}
