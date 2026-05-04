const assetMap: Record<string, string> = {
  '/barber_shop.png': '/barber_shop.png',
  '/skillink_post1_apprentice_v2.png': '/skillink_post1_apprentice_v2.png',
  '/skillink_post2_mentor_v2.png': '/skillink_post2_mentor_v2.png',
  '/skillink_post3_general_v2.png': '/skillink_post3_general_v2.png',
};

// Default strings for direct use if needed

export const barberShop = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800";export const apprenticeImg = "https://i.imgur.com/Uhl5AxV.jpg";
export const apprenticeImg = "https://i.imgur.com/Uhl5AxV.jpg";
export const mentorImg = "https://i.imgur.com/8x2Qy8x.jpg";
export const generalImg = "https://i.imgur.com/Uhl5AxV.jpg";
 */
export function resolveAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  return assetMap[path] || path;
}

