
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
  const oppCity = (opportunity.location || opportunity.profiles?.city || '').trim().toLowerCase();
  const myCity = (myProfile.city || myProfile.location || '').trim().toLowerCase();

  if (oppCity && myCity) {
    if (oppCity === myCity) {
      locationScore = 40;
      details.push(isRtl ? 'מיקום זהה - מושלם לעבודה קרובה' : 'Same location - perfect for local work');
    } else if (oppCity.includes(myCity) || myCity.includes(oppCity)) {
      locationScore = 30;
      details.push(isRtl ? 'מיקום קרוב מאוד' : 'Location is very close');
    } else {
      // Check for common regions or nearby cities (simplified)
      const regions = [
        ['תל אביב', 'רמת גן', 'גבעתיים', 'חולון', 'בת ים', 'בני ברק'],
        ['פתח תקווה', 'ראש העין', 'הוד השרון', 'כפר סבא', 'רעננה'],
        ['ירושלים', 'מבשרת ציון', 'מעלה אדומים', 'בית שמש'],
        ['חיפה', 'קריות', 'נשר', 'טירת כרמל'],
        ['ראשון לציון', 'נס ציונה', 'רחובות', 'לוד', 'רמלה']
      ];
      
      const sameRegion = regions.find(r => r.some(c => oppCity.includes(c.toLowerCase())) && r.some(c => myCity.includes(c.toLowerCase())));
      
      if (sameRegion) {
        locationScore = 20;
        details.push(isRtl ? 'באותו אזור גיאוגרפי' : 'In the same geographic area');
      } else {
        locationScore = 0;
        details.push(isRtl ? 'מיקום מרוחק' : 'Location is far away');
      }
    }
  } else {
    locationScore = 0; // Much stricter
    details.push(isRtl ? 'מיקום לא צוין' : 'Location not specified');
  }

  // 2. Role & Occupation Alignment (30 points)
  const isMentorOffer = (opportunity.type || '').includes('mentor');
  const isMenteeSeeking = (opportunity.type || '').includes('mentee');
  
  const myRole = myProfile.role || '';
  if (isMentorOffer && myRole === 'mentee') {
    roleScore += 10;
  } else if (isMenteeSeeking && myRole === 'mentor') {
    roleScore += 10;
  }

  const oppTitle = (opportunity.title || '').toLowerCase();
  const oppAbout = (opportunity.about_work || opportunity.aboutWork || '').toLowerCase();
  const oppTrade = (opportunity.trade || opportunity.ownerTrade || opportunity.profession || opportunity.profiles?.occupation || '').toLowerCase();
  const oppLearningFocus = (opportunity.learning_focus || opportunity.learningFocus || '').toLowerCase();
  const myOcc = (myProfile.occupation || '').toLowerCase();
  // The learner's goal / the mentor's target — this is what should drive the
  // field match, not a non-existent `learningIntent` field.
  const myIntent = (myProfile.what_i_want_to_learn || myProfile.who_i_want_to_teach || myProfile.learningIntent || '').toLowerCase();
  
  // Semantic keyword matching for learning intent
  if (myIntent) {
    const intentKeywords = myIntent.split(/[\s,]+/).filter(k => k.length > 2);
    const matchesIntent = intentKeywords.some(k => 
      oppTitle.includes(k) || 
      oppAbout.includes(k) || 
      oppTrade.includes(k) ||
      oppLearningFocus.includes(k)
    );
    if (matchesIntent) {
      roleScore += 15;
      details.push(isRtl ? 'מתאים בדיוק למה שאתה רוצה ללמוד' : 'Matches exactly what you want to learn');
    }
  }

  if (myOcc && (
    oppTitle.includes(myOcc) || 
    myOcc.includes(oppTitle) || 
    oppAbout.includes(myOcc) || 
    oppTrade.includes(myOcc) || 
    oppLearningFocus.includes(myOcc)
  )) {
    roleScore += 15;
    details.push(isRtl ? 'התאמה מקצועית גבוהה' : 'High professional alignment');
  } else if (roleScore > 0 && !details.some(d => d.includes('ללמוד') || d.includes('learn'))) {
    details.push(isRtl ? 'סוג תפקיד מתאים' : 'Matching role type');
  }

  // 3. Trust & Verification (30 points)
  if (opportunity.profiles?.is_verified) {
    trustScore += 20;
    details.push(isRtl ? 'מפרסם מאומת (V)' : 'Verified poster (V)');
  }
  
  // Profile completion bonus
  const completionFields = [myProfile.full_name, myProfile.avatar_url, myProfile.occupation, myProfile.city || myProfile.location];
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
