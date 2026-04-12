/**
 * Tests: Email notification for protocodex user
 *
 * Validates:
 *   - Email is sent when protocodex is NOT in global chat and someone messages
 *   - Email is NOT sent when protocodex IS in global chat
 *   - Debounce: multiple messages are batched into one email
 *   - Only protocodex gets notified, not other users
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
  env.emailsSent.length = 0; // clear email buffer
});

describe('Email notifications for protocodex', () => {
  it('sends email when protocodex is NOT in global chat', async () => {
    // protocodex is NOT connected at all
    const sender = await connectClient(env.port, 'someone');
    sender.emit('join-global-chat');
    await waitForEvent(sender, 'chat-history');

    const chatP = waitForEvent(sender, 'chat');
    sender.emit('send', { lobby: 'global', message: 'Hey protocodex!' });
    await chatP;

    // Wait for debounce (200ms in test env)
    await delay(400);

    expect(env.emailsSent.length).toBe(1);
    expect(env.emailsSent[0].to).toBe('sasnow62@gmail.com');
    expect(env.emailsSent[0].messages.length).toBe(1);
    expect(env.emailsSent[0].messages[0].message).toBe('Hey protocodex!');

    sender.disconnect();
  });

  it('does NOT send email when protocodex IS in global chat', async () => {
    const proto = await connectClient(env.port, 'protocodex');
    proto.emit('join-global-chat');
    await waitForEvent(proto, 'chat-history');

    const sender = await connectClient(env.port, 'chatter');
    sender.emit('join-global-chat');
    await waitForEvent(sender, 'chat-history');

    const chatP = waitForEvent(sender, 'chat');
    sender.emit('send', { lobby: 'global', message: 'Hello room' });
    await chatP;

    await delay(400);

    expect(env.emailsSent.length).toBe(0);

    proto.disconnect();
    sender.disconnect();
  });

  it('batches multiple messages into one digest email', async () => {
    const sender = await connectClient(env.port, 'rapid-fire');
    sender.emit('join-global-chat');
    await waitForEvent(sender, 'chat-history');

    // Send 3 messages quickly
    for (let i = 0; i < 3; i++) {
      const p = waitForEvent(sender, 'chat');
      sender.emit('send', { lobby: 'global', message: `burst-${i}` });
      await p;
    }

    // Wait for debounce
    await delay(400);

    // Should be ONE email with 3 messages
    expect(env.emailsSent.length).toBe(1);
    expect(env.emailsSent[0].messages.length).toBe(3);
    expect(env.emailsSent[0].messages[0].message).toBe('burst-0');
    expect(env.emailsSent[0].messages[2].message).toBe('burst-2');
    expect(env.emailsSent[0].subject).toContain('3 new messages');

    sender.disconnect();
  });

  it('does NOT send email when protocodex leaves and then re-joins before debounce', async () => {
    // protocodex is offline when message is sent
    const sender = await connectClient(env.port, 'alerter');
    sender.emit('join-global-chat');
    await waitForEvent(sender, 'chat-history');

    const chatP = waitForEvent(sender, 'chat');
    sender.emit('send', { lobby: 'global', message: 'proto offline msg' });
    await chatP;

    // Now protocodex joins BEFORE the debounce fires
    const proto = await connectClient(env.port, 'protocodex');
    proto.emit('join-global-chat');
    await waitForEvent(proto, 'chat-history');

    // Wait for debounce
    await delay(400);

    // Email should NOT be sent because proto came back online
    expect(env.emailsSent.length).toBe(0);

    sender.disconnect();
    proto.disconnect();
  });

  it('only notifies for protocodex, not other offline users', async () => {
    // Both protocodex and "other-user" are offline
    // Only protocodex should get notified
    const sender = await connectClient(env.port, 'notifier');
    sender.emit('join-global-chat');
    await waitForEvent(sender, 'chat-history');

    const chatP = waitForEvent(sender, 'chat');
    sender.emit('send', { lobby: 'global', message: 'test notification' });
    await chatP;

    await delay(400);

    // Only one email, to protocodex's address
    expect(env.emailsSent.length).toBe(1);
    expect(env.emailsSent[0].to).toBe('sasnow62@gmail.com');

    sender.disconnect();
  });
});
