const assetMap: Record<string, string> = {
  '/barber_shop.png': '/barber_shop.png',
  '/skillink_post1_apprentice_v2.png': '/skillink_post1_apprentice_v2.png',
  '/skillink_post2_mentor_v2.png': '/skillink_post2_mentor_v2.png',
  '/skillink_post3_general_v2.png': '/skillink_post3_general_v2.png',
};

// Default strings for direct use if needed
export const barberShop = '/barber_shop.png';
export const apprenticeImg = '/skillink_post1_apprentice_v2.png';
export const mentorImg = '/skillink_post2_mentor_v2.png';
export const generalImg = '/skillink_post3_general_v2.png';

/**
 * Resolves a path to a properly imported asset if it's one of the default assets.
 * This ensures that built-in images work correctly in production environments like Vercel.
 */
export function resolveAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  return assetMap[path] || path;
}

