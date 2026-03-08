
export interface MatchBreakdown {
  location: number;
  role: number;
  trust: number;
  details: string[];
}

export const calculateMatchScore = (opportunity: any, myProfile: any, isRtl: boolean): { score: number; breakdown: MatchBreakdown } => {
  if (!myProfile) return { score: 0, breakdown: { location: 0, role: 0, trust: 0, details: [] } };
  
  // Special case: Viewing own opportunity
  if (opportunity.owner_id === myProfile.id) {
    return {
      score: 100,
      breakdown: {
        location: 40,
        role: 30,
        trust: 30,
        details: [isRtl ? 'זה הפוסט שלך!' : 'This is your own post!']
      }
    };
  }

  let locationScore = 0;
  let roleScore = 0;
  let trustScore = 0;
  const details: string[] = [];

  // 1. Location Match (40 points)
  const oppCity = (opportunity.location || opportunity.profiles?.city || '').toLowerCase();
  const myCity = (myProfile.city || myProfile.location || '').toLowerCase();

  if (oppCity && myCity && oppCity === myCity) {
    locationScore = 40;
    details.push(isRtl ? 'מיקום זהה - מושלם לעבודה קרובה' : 'Same location - perfect for local work');
  } else if (oppCity && myCity && (oppCity.includes(myCity) || myCity.includes(oppCity))) {
    locationScore = 25;
    details.push(isRtl ? 'מיקום קרוב או באזור' : 'Location is nearby or in the same area');
  } else {
    locationScore = 5;
    details.push(isRtl ? 'מיקום מרוחק' : 'Location is far away');
  }

  // 2. Role & Occupation Alignment (30 points)
  if (opportunity.type === 'mentor_offer' && myProfile.role === 'mentee') {
    roleScore += 15;
  } else if (opportunity.type === 'mentee_seeking' && myProfile.role === 'mentor') {
    roleScore += 15;
  }

  const oppTitle = (opportunity.title || '').toLowerCase();
  const myOcc = (myProfile.occupation || '').toLowerCase();
  if (myOcc && (oppTitle.includes(myOcc) || myOcc.includes(oppTitle))) {
    roleScore += 15;
    details.push(isRtl ? 'התאמה מקצועית גבוהה' : 'High professional alignment');
  } else if (roleScore > 0) {
    details.push(isRtl ? 'סוג תפקיד מתאים' : 'Matching role type');
  }

  // 3. Trust & Verification (30 points)
  if (opportunity.profiles?.is_verified) {
    trustScore += 20;
    details.push(isRtl ? 'מפרסם מאומת (V)' : 'Verified poster (V)');
  }
  
  // Profile completion bonus
  const completionFields = [myProfile.full_name, myProfile.avatar_url, myProfile.occupation, myProfile.city];
  const completed = completionFields.filter(Boolean).length;
  if (completed >= 3) {
    trustScore += 10;
    details.push(isRtl ? 'פרופיל אישי מלא' : 'Complete personal profile');
  }

  const totalScore = Math.min(100, locationScore + roleScore + trustScore);
  
  return {
    score: totalScore,
    breakdown: {
      location: locationScore,
      role: roleScore,
      trust: trustScore,
      details
    }
  };
};
