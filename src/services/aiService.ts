import { callGemini } from "../lib/ai";

const MODEL_NAME = "gemini-flash-lite-latest";

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
  // Heuristic filtering for performance: take top 20 based on basic scoring first
  const candidates = Array.isArray(opportunities) ? basicOpportunityScoring(userProfile, opportunities).slice(0, 20) : [];

  if (candidates.length === 0) return [];

  try {
    const prompt = `
      You are a highly sophisticated recruitment AI for "SkillLink", an Israeli marketplace for professional mentorships and artisanal apprenticeships.
      Match the user with these opportunities.
      
      CRITICAL INSTRUCTIONS:
      1. BE EXTREMELY STRICT. If an opportunity does not match the user's trade (occupation) or professional goals, give it a score BELOW 30%.
      2. High scores (80%+) are reserved ONLY for exact trade matches in the same or nearby city.
      3. Provide a "reason" in Hebrew (1 professional sentence) that justifies the match.
      
      User Profile:
      - Name: ${userProfile.name || userProfile.full_name}
      - Trade: ${userProfile.trade || userProfile.occupation || 'Not specified'}
      - Goals: ${userProfile.bio || 'Not specified'}
      - Location: ${userProfile.city || userProfile.location || 'Not specified'}
      
      Opportunities:
      ${candidates.map((o: any) => `
        - ID: ${o.id}
          Title: ${o.title}
          Trade: ${o.profession || o.trade || o.ownerTrade || o.profiles?.occupation || 'Not specified'}
          Location: ${o.location}
      `).join('\n')}
      
      Return a JSON array: [{"id": number, "score": number, "reason": string}].
    `;

    const response = await callGemini({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "NUMBER" },
              score: { type: "NUMBER" },
              reason: { type: "STRING" }
            },
            required: ["id", "score", "reason"]
          }
        }
      }
    });

    const aiOutput = JSON.parse(response.text || '[]');

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
  const candidates = Array.isArray(profiles) ? basicProfileScoring(userProfile, profiles).slice(0, 20) : [];

  if (candidates.length === 0) return [];

  try {
    const prompt = `
      You are a professional Israeli mentorship AI for "SkillLink".
      Compare the current user's profile with a list of potential mentors/apprentices.
      
      CRITICAL: 
      - Same trade (occupation) matches are GOLD (90%+).
      - If user is "mentee", find "mentor" in same trade.
      - If user is "mentor", find "mentee" in same trade.
      - Be strict. If no professional connection, score below 20%.

      User Profile:
      - Name: ${userProfile.name || userProfile.full_name}
      - Trade: ${userProfile.trade || userProfile.occupation}
      - Role: ${userProfile.role}
      - Bio: ${userProfile.bio}

      Candidates:
      ${candidates.map((p: any) => `
        - ID: ${p.id}
          Name: ${p.name || p.full_name}
          Trade: ${p.trade || p.occupation}
          Role: ${p.role}
      `).join('\n')}

      Return JSON array: [{"id": number, "score": number, "reason": string}]. Reason in Hebrew.
    `;

    const response = await callGemini({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "NUMBER" },
              score: { type: "NUMBER" },
              reason: { type: "STRING" }
            },
            required: ["id", "score", "reason"]
          }
        }
      }
    });

    const aiOutput = JSON.parse(response.text || '[]');
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
  // profiles table uses 'city', fallback to 'location' for compatibility
  const userCity = userProfile.city || userProfile.location || '';
  const userLatLon = CITY_COORDS[userCity] || [32.0853, 34.7818];

  return opportunities.map(opp => {
    let score = 10;

    // Trade match — check all possible field names
    const userTrade = (userProfile.occupation || userProfile.trade || '').toLowerCase();
    const oppTrade = (
      opp.profession ||
      opp.trade ||
      opp.ownerTrade ||
      opp.profiles?.occupation ||
      ''
    ).toLowerCase();
    const oppTitle = (opp.title || '').toLowerCase();

    if (userTrade && oppTrade && (
      oppTrade.includes(userTrade) ||
      userTrade.includes(oppTrade) ||
      oppTrade === userTrade ||
      oppTitle.includes(userTrade)
    )) {
      score += 55;
    }

    // Location match
    const oppLatLon = CITY_COORDS[opp.location] || [32.0853, 34.7818];
    const distance = calculateDistance(userLatLon, oppLatLon);

    if (distance < 10) score += 20;
    else if (distance < 30) score += 10;
    else if (distance < 60) score += 5;

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
