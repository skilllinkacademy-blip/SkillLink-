const assetMap: Record<string, string> = {
  // Trade Images (Rectangles) - Thematic & Professional
  'trade_barber': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200',
  'trade_carpentry': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
  'trade_electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
  'trade_construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
  'trade_welding': 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1200',
  'trade_mechanic': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200',
  'trade_plumbing': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
  
  // Specific Mentorship Moments
  'trade_mentorship_1': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
  'trade_mentorship_2': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1200',
  'trade_mentorship_3': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
  'trade_mentorship_4': 'https://images.unsplash.com/photo-1549633030-cf441e86082c?auto=format&fit=crop&q=80&w=1200',

  // Avatars (Diverse & Professional Professionals)
  'avatar_1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'avatar_2': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'avatar_3': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'avatar_4': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'avatar_5': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
  'avatar_6': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
  'avatar_7': 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=250'
};

// Map legacy paths for compatibility
assetMap['/barber_shop.png'] = assetMap['trade_barber'];
assetMap['/skillink_post1_apprentice_v2.png'] = assetMap['trade_carpentry'];
assetMap['/skillink_post2_mentor_v2.png'] = assetMap['trade_electrical'];
assetMap['/skillink_post3_general_v2.png'] = assetMap['trade_construction'];

export const barberShop = assetMap['trade_barber'];
export const apprenticeImg = assetMap['trade_mentorship_1'];
export const mentorImg = assetMap['trade_mentorship_2'];
export const generalImg = assetMap['trade_mentorship_3'];
export const instructionImg = assetMap['trade_mentorship_4'];
export const plumbingImg = assetMap['trade_plumbing'];
export const electricalImg = assetMap['trade_electrical'];
export const constructionImg = assetMap['trade_construction'];
export const weldingImg = assetMap['trade_welding'];
export const mechanicImg = assetMap['trade_mechanic'];

/**
 * Resolves a path to a properly imported asset if it's one of the default assets.
 * This ensures that built-in images work correctly in production environments like Vercel.
 */
export function resolveAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  return assetMap[path] || path;
}

