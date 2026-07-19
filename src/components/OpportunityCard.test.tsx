import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import OpportunityCard from './OpportunityCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { id: 'viewer', role: 'mentee', city: 'תל אביב', full_name: 'צופה' },
  }),
}));

const opportunity = {
  id: 'opp-1',
  type: 'mentor_offer' as const,
  title: 'דרוש מתלמד לנגרות',
  location: 'תל אביב',
  about_work: 'עבודה בנגרייה',
  created_at: new Date().toISOString(),
  owner_id: 'mentor-1',
  profiles: {
    full_name: 'יוסי הנגר',
    occupation: 'נגרות',
    is_verified: true,
    username: 'yossi',
  },
};

function renderCard(props: Partial<React.ComponentProps<typeof OpportunityCard>> = {}) {
  return render(
    <MemoryRouter>
      <OpportunityCard opportunity={opportunity} isRtl={true} {...props} />
    </MemoryRouter>
  );
}

describe('OpportunityCard', () => {
  it('renders title, owner and location', () => {
    renderCard();
    expect(screen.getByText('דרוש מתלמד לנגרות')).toBeInTheDocument();
    expect(screen.getByText('יוסי הנגר')).toBeInTheDocument();
    expect(screen.getByText(/תל אביב/)).toBeInTheDocument();
  });

  it('navigates to the opportunity details on click', async () => {
    renderCard();
    await userEvent.click(screen.getByText('דרוש מתלמד לנגרות'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/opportunities/opp-1');
  });

  it('shows a match score for the viewer', () => {
    renderCard();
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('respects a precomputed match score', () => {
    renderCard({ opportunity: { ...opportunity, match_score: 87 } as any });
    expect(screen.getByText(/87%/)).toBeInTheDocument();
  });
});
