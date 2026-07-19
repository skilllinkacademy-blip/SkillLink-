import { describe, expect, it, vi } from 'vitest';
import { getOrCreateConversation, sendMessage } from './chat';

vi.mock('./connectionTracking', () => ({
  checkAndUpdateConnectionStatus: vi.fn(),
}));

type QueryResult = { data?: any; error?: any };

// Minimal chainable mock of the supabase query builder. Each call to
// from() consumes the next scripted result, mirroring PostgREST responses.
function mockSupabase(user: { id: string } | null, results: QueryResult[]) {
  let call = 0;
  const next = () => results[call++] ?? { data: null, error: null };
  const builder = (result: QueryResult) => {
    const chain: any = {};
    for (const m of ['select', 'insert', 'update', 'or', 'eq', 'order']) {
      chain[m] = vi.fn(() => chain);
    }
    chain.single = vi.fn(() => Promise.resolve(result));
    chain.then = (resolve: any) => Promise.resolve(result).then(resolve);
    return chain;
  };
  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve(
          user
            ? { data: { user }, error: null }
            : { data: { user: null }, error: { message: 'not authenticated' } }
        )
      ),
    },
    from: vi.fn(() => builder(next())),
  } as any;
}

describe('getOrCreateConversation', () => {
  it('throws when the user is not authenticated', async () => {
    const sb = mockSupabase(null, []);
    await expect(getOrCreateConversation(sb, 'other')).rejects.toThrow('User not authenticated');
  });

  it('returns the existing conversation when one exists', async () => {
    const existing = { id: 'conv-1', participant_1: 'me', participant_2: 'other' };
    const sb = mockSupabase({ id: 'me' }, [{ data: existing, error: null }]);
    const conv = await getOrCreateConversation(sb, 'other');
    expect(conv).toEqual(existing);
    expect(sb.from).toHaveBeenCalledTimes(1);
  });

  it('creates a new conversation when none exists (PGRST116)', async () => {
    const created = { id: 'conv-2', participant_1: 'me', participant_2: 'other' };
    const sb = mockSupabase({ id: 'me' }, [
      { data: null, error: { code: 'PGRST116' } },
      { data: created, error: null },
    ]);
    const conv = await getOrCreateConversation(sb, 'other');
    expect(conv).toEqual(created);
    expect(sb.from).toHaveBeenCalledTimes(2);
  });

  it('propagates unexpected fetch errors', async () => {
    const sb = mockSupabase({ id: 'me' }, [
      { data: null, error: { code: '500', message: 'boom' } },
    ]);
    await expect(getOrCreateConversation(sb, 'other')).rejects.toMatchObject({ code: '500' });
  });
});

describe('sendMessage', () => {
  it('addresses the message to the other participant', async () => {
    const message = { id: 'msg-1', content: 'שלום' };
    const sb = mockSupabase({ id: 'me' }, [
      { data: { participant_1: 'other', participant_2: 'me' }, error: null },
      { data: message, error: null },
      { data: null, error: null },
    ]);
    const result = await sendMessage(sb, 'conv-1', 'שלום');
    expect(result).toEqual(message);
    expect(sb.from).toHaveBeenCalledWith('messages');
    expect(sb.from).toHaveBeenCalledWith('conversations');
  });

  it('throws when the conversation does not exist', async () => {
    const sb = mockSupabase({ id: 'me' }, [{ data: null, error: { message: 'not found' } }]);
    await expect(sendMessage(sb, 'missing', 'שלום')).rejects.toThrow('Conversation not found');
  });
});
