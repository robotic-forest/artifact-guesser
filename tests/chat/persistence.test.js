/**
 * Tests: Chat message persistence to MongoDB
 *
 * Validates that messages sent via Socket.IO are written to the
 * chat_messages collection and survive across connections.
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

describe('Chat persistence', () => {
  it('stores a sent message in MongoDB', async () => {
    const client = await connectClient(env.port, 'alice');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    // Send a message
    const chatPromise = waitForEvent(client, 'chat');
    client.emit('send', { lobby: 'global', message: 'Hello world' });
    const msg = await chatPromise;

    expect(msg.username).toBe('alice');
    expect(msg.message).toBe('Hello world');
    expect(msg.lobby).toBe('global');
    expect(msg.id).toBeDefined();
    expect(msg.timestamp).toBeTypeOf('number');

    // Verify it's in the DB
    const dbMsg = await env.chatCol.findOne({ id: msg.id });
    expect(dbMsg).not.toBeNull();
    expect(dbMsg.message).toBe('Hello world');
    expect(dbMsg.username).toBe('alice');

    client.disconnect();
  });

  it('persists messages across client reconnections', async () => {
    // Client 1 sends a message
    const client1 = await connectClient(env.port, 'bob');
    client1.emit('join-global-chat');
    await waitForEvent(client1, 'chat-history');

    const chatPromise = waitForEvent(client1, 'chat');
    client1.emit('send', { lobby: 'global', message: 'Persistent message' });
    await chatPromise;
    client1.disconnect();
    await delay(100);

    // Client 2 connects and should receive the message in history
    const client2 = await connectClient(env.port, 'carol');
    client2.emit('join-global-chat');
    const history = await waitForEvent(client2, 'chat-history');

    expect(history.messages.length).toBe(1);
    expect(history.messages[0].message).toBe('Persistent message');
    expect(history.messages[0].username).toBe('bob');

    client2.disconnect();
  });

  it('stores multiple messages in chronological order', async () => {
    const client = await connectClient(env.port, 'dave');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    for (let i = 0; i < 5; i++) {
      const p = waitForEvent(client, 'chat');
      client.emit('send', { lobby: 'global', message: `msg-${i}` });
      await p;
    }

    // Reconnect and check order
    client.disconnect();
    await delay(100);

    const client2 = await connectClient(env.port, 'dave');
    client2.emit('join-global-chat');
    const history = await waitForEvent(client2, 'chat-history');

    expect(history.messages.length).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(history.messages[i].message).toBe(`msg-${i}`);
    }
    // Timestamps should be non-decreasing
    for (let i = 1; i < 5; i++) {
      expect(history.messages[i].timestamp).toBeGreaterThanOrEqual(
        history.messages[i - 1].timestamp,
      );
    }

    client2.disconnect();
  });

  it('assigns unique IDs to each message', async () => {
    const client = await connectClient(env.port, 'eve');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    const ids = [];
    for (let i = 0; i < 3; i++) {
      const p = waitForEvent(client, 'chat');
      client.emit('send', { lobby: 'global', message: `id-test-${i}` });
      const msg = await p;
      ids.push(msg.id);
    }

    // All IDs should be unique
    expect(new Set(ids).size).toBe(3);

    client.disconnect();
  });

  it('rejects messages from unregistered clients', async () => {
    // Directly connect without registering
    const { io: ioClient } = await import('socket.io-client');
    const raw = ioClient(`http://localhost:${env.port}`, {
      transports: ['websocket'],
      forceNew: true,
    });
    await new Promise((r) => raw.on('connect', r));

    // Try to send without register-client
    raw.emit('send', { lobby: 'global', message: 'should be ignored' });
    await delay(200);

    // Nothing should be in the DB
    const count = await env.chatCol.countDocuments({});
    expect(count).toBe(0);

    raw.disconnect();
  });

  it('rejects empty/whitespace-only messages', async () => {
    const client = await connectClient(env.port, 'frank');
    client.emit('join-global-chat');
    await waitForEvent(client, 'chat-history');

    client.emit('send', { lobby: 'global', message: '' });
    client.emit('send', { lobby: 'global', message: '   ' });
    await delay(200);

    const count = await env.chatCol.countDocuments({});
    expect(count).toBe(0);

    client.disconnect();
  });
});
