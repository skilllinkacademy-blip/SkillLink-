import { describe, expect, it } from 'vitest';
import { calculateMatchScore } from './matchScore';

const mentee = {
  id: 'mentee-1',
  role: 'mentee',
  city: 'תל אביב',
  full_name: 'טסט מתלמד',
  avatar_url: 'x.png',
  occupation: 'נגרות',
};

const mentorOffer = {
  id: 'opp-1',
  owner_id: 'mentor-1',
  type: 'mentor_offer',
  title: 'דרוש מתלמד לנגרות',
  location: 'תל אביב',
};

describe('calculateMatchScore', () => {
  it('returns 0 when profile is missing', () => {
    const { score } = calculateMatchScore(mentorOffer, null, true);
    expect(score).toBe(0);
  });

  it('returns 100 for your own opportunity', () => {
    const { score, breakdown } = calculateMatchScore(
      { ...mentorOffer, owner_id: 'mentee-1' },
      mentee,
      true
    );
    expect(score).toBe(100);
    expect(breakdown.details[0]).toContain('שלך');
  });

  it('gives full location score for exact city match', () => {
    const { breakdown } = calculateMatchScore(mentorOffer, mentee, true);
    expect(breakdown.location).toBe(40);
  });

  it('reads the profile city field (regression: profiles table has city, not location)', () => {
    const profileWithCityOnly = { ...mentee };
    const { breakdown } = calculateMatchScore(mentorOffer, profileWithCityOnly, true);
    expect(breakdown.location).toBeGreaterThan(0);
  });

  it('gives partial score for same-region cities', () => {
    const { breakdown } = calculateMatchScore(
      { ...mentorOffer, location: 'רמת גן' },
      mentee,
      true
    );
    expect(breakdown.location).toBe(20);
  });

  it('gives no location score for distant cities', () => {
    const { breakdown } = calculateMatchScore(
      { ...mentorOffer, location: 'אילת' },
      mentee,
      true
    );
    expect(breakdown.location).toBe(0);
  });

  it('rewards role alignment: mentee viewing a mentor offer', () => {
    const { breakdown } = calculateMatchScore(mentorOffer, mentee, true);
    expect(breakdown.role).toBeGreaterThanOrEqual(10);
  });

  it('gives no role points when a mentor views a mentor offer', () => {
    const mentor = { ...mentee, role: 'mentor', occupation: '' };
    const { breakdown } = calculateMatchScore(
      { ...mentorOffer, title: 'אחר' },
      mentor,
      true
    );
    expect(breakdown.role).toBe(0);
  });

  it('rewards occupation match against the opportunity title', () => {
    const { breakdown } = calculateMatchScore(mentorOffer, mentee, true);
    expect(breakdown.role).toBeGreaterThanOrEqual(25);
  });

  it('adds trust points for a verified poster', () => {
    const verified = { ...mentorOffer, profiles: { is_verified: true } };
    const { breakdown } = calculateMatchScore(verified, mentee, true);
    expect(breakdown.trust).toBeGreaterThanOrEqual(20);
  });

  it('never exceeds 100', () => {
    const maxed = {
      ...mentorOffer,
      profiles: { is_verified: true },
      about_work: 'נגרות',
    };
    const { score } = calculateMatchScore(maxed, mentee, true);
    expect(score).toBeLessThanOrEqual(100);
  });
});
