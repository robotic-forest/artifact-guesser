/**
 * Tests: Chat pagination and incremental updates
 *
 * Validates the new event protocol:
 *   - chat-history: paginated initial load
 *   - chat: single incremental message
 *   - chat-message-deleted: removal by ID
 *   - request-older-messages: cursor-based pagination
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestEnv,
  connectClient,
  destroyTestEnv,
  waitForEvent,
  delay,
} from '../helpers/setup.js';

let env;

beforeAll(async () => {
  env = await createTestEnv();
});

afterAll(async () => {
  await destroyTestEnv(env);
});

beforeEach(async () => {
  await env.chatCol.deleteMany({});
});

describe('Initial load (chat-history event)', () => {
  it('sends chat-history with messages array and hasMore flag on join', async () => {
    const client = await connectClient(env.port, 'alice');
    client.emit('join-global-chat');
    const history = await waitForEvent(client, 'chat-history');

    expect(history).toHaveProperty('messages');
    expect(history).toHaveProperty('hasMore');
    expect(Array.isArray(history.messages)).toBe(true);
    expect(history.hasMore).toBe(false); // no messages yet

    client.disconnect();
  });

  it('returns existing messages on join', async () => {
    // Seed 3 messages
    for (let i = 0; i < 3; i++) {
      await env.chatCol.insertOne({
        id: `seed-${i}`,
        lobby: 'global',
        username: 'seeder',
        message: `seed-msg-${i}`,
        timestamp: Date.now() + i,
      });
    }

    const client = await connectClient(env.port, 'bob');
    client.emit('join-global-chat');
    const history = await waitForEvent(client, 'chat-history');

    expect(history.messages.length).toBe(3);
    expect(history.hasMore).toBe(false);
    // Should be in chronological order
    expect(history.messages[0].message).toBe('seed-msg-0');
    expect(history.messages[2].message).toBe('seed-msg-2');

    client.disconnect();
  });

  it('sets hasMore=true when there are more than PAGE_SIZE messages', async () => {
    // Seed exactly PAGE_SIZE messages
    const docs = [];
    for (let i = 0; i < env.CHAT_PAGE_SIZE; i++) {
      docs.push({
        id: `bulk-${i}`,
        lobby: 'global',
        username: 'bulk',
        message: `bulk-${i}`,
        timestamp: 1000000 + i,
      });
    }
    await env.chatCol.insertMany(docs);

    const client = await connectClient(env.port, 'carol');
    client.emit('join-global-chat');
    const history = await waitForEvent(client, 'chat-history');

    // PAGE_SIZE messages returned means there *might* be more
    expect(history.messages.length).toBe(env.CHAT_PAGE_SIZE);
    expect(history.hasMore).toBe(true);

    client.disconnect();
  });
});

describe('Incremental updates (chat event)', () => {
  it('emits single message objects (not arrays) for new messages', async () => {
    const client = await connectClient(env.port, 'dave');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    const chatPromise = waitForEvent(client, 'chat');
    client.emit('send', { lobby: 'global', message: 'single msg' });
    const msg = await chatPromise;

    // Should be a single object, NOT an array
    expect(Array.isArray(msg)).toBe(false);
    expect(msg).toHaveProperty('id');
    expect(msg).toHaveProperty('username', 'dave');
    expect(msg).toHaveProperty('message', 'single msg');
    expect(msg).toHaveProperty('lobby', 'global');
    expect(msg).toHaveProperty('timestamp');

    client.disconnect();
  });

  it('broadcasts new messages to all clients in the global chat room', async () => {
    const client1 = await connectClient(env.port, 'eve');
    const client2 = await connectClient(env.port, 'frank');

    client1.emit('join-global-chat');
    client2.emit('join-global-chat');
    await waitForEvent(client1, 'chat-history');
    await waitForEvent(client2, 'chat-history');

    // Client1 sends, both should receive
    const p1 = waitForEvent(client1, 'chat');
    const p2 = waitForEvent(client2, 'chat');
    client1.emit('send', { lobby: 'global', message: 'broadcast test' });

    const [msg1, msg2] = await Promise.all([p1, p2]);
    expect(msg1.message).toBe('broadcast test');
    expect(msg2.message).toBe('broadcast test');
    expect(msg1.id).toBe(msg2.id); // same message

    client1.disconnect();
    client2.disconnect();
  });

  it('does not send messages to clients not in global chat room', async () => {
    const inRoom = await connectClient(env.port, 'grace');
    const outRoom = await connectClient(env.port, 'heidi');

    inRoom.emit('join-global-chat');
    await waitForEvent(inRoom, 'chat-history');
    // heidi does NOT join global chat

    let heidiGotMessage = false;
    outRoom.on('chat', () => {
      heidiGotMessage = true;
    });

    const p = waitForEvent(inRoom, 'chat');
    inRoom.emit('send', { lobby: 'global', message: 'room only' });
    await p;
    await delay(200);

    expect(heidiGotMessage).toBe(false);

    inRoom.disconnect();
    outRoom.disconnect();
  });
});

describe('Pagination (request-older-messages)', () => {
  it('returns older messages before a given timestamp', async () => {
    // Seed messages with known timestamps
    for (let i = 0; i < 10; i++) {
      await env.chatCol.insertOne({
        id: `page-${i}`,
        lobby: 'global',
        username: 'pager',
        message: `page-msg-${i}`,
        timestamp: 1000 + i * 100,
      });
    }

    const client = await connectClient(env.port, 'ivan');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    // Request messages before timestamp 1500 (messages 0-4 have ts 1000-1400)
    const result = await new Promise((resolve) => {
      client.emit(
        'request-older-messages',
        { lobby: 'global', before: 1500 },
        resolve,
      );
    });

    expect(result.messages.length).toBe(5);
    expect(result.messages[0].message).toBe('page-msg-0');
    expect(result.messages[4].message).toBe('page-msg-4');
    expect(result.hasMore).toBe(false);

    client.disconnect();
  });

  it('returns messages in chronological order', async () => {
    for (let i = 0; i < 5; i++) {
      await env.chatCol.insertOne({
        id: `order-${i}`,
        lobby: 'global',
        username: 'order',
        message: `order-${i}`,
        timestamp: 5000 + i * 10,
      });
    }

    const client = await connectClient(env.port, 'judy');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    const result = await new Promise((resolve) => {
      client.emit(
        'request-older-messages',
        { lobby: 'global', before: 9999 },
        resolve,
      );
    });

    for (let i = 1; i < result.messages.length; i++) {
      expect(result.messages[i].timestamp).toBeGreaterThanOrEqual(
        result.messages[i - 1].timestamp,
      );
    }

    client.disconnect();
  });

  it('returns hasMore=true when page is full', async () => {
    // Seed PAGE_SIZE + 10 messages
    const docs = [];
    for (let i = 0; i < env.CHAT_PAGE_SIZE + 10; i++) {
      docs.push({
        id: `hasmore-${i}`,
        lobby: 'global',
        username: 'bulk',
        message: `hasmore-${i}`,
        timestamp: 1000 + i,
      });
    }
    await env.chatCol.insertMany(docs);

    const client = await connectClient(env.port, 'karl');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    // Request all before a very large timestamp
    const result = await new Promise((resolve) => {
      client.emit(
        'request-older-messages',
        { lobby: 'global', before: 999999 },
        resolve,
      );
    });

    expect(result.messages.length).toBe(env.CHAT_PAGE_SIZE);
    expect(result.hasMore).toBe(true);

    client.disconnect();
  });

  it('returns empty array when no older messages exist', async () => {
    const client = await connectClient(env.port, 'laura');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    const result = await new Promise((resolve) => {
      client.emit(
        'request-older-messages',
        { lobby: 'global', before: 1 },
        resolve,
      );
    });

    expect(result.messages).toEqual([]);
    expect(result.hasMore).toBe(false);

    client.disconnect();
  });
});
