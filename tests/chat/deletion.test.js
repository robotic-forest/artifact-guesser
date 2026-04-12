/**
 * Tests: Chat message deletion
 *
 * Validates:
 *   - Admin/protocodex can delete messages
 *   - Non-admins cannot delete
 *   - Deletion removes from DB
 *   - chat-message-deleted event is broadcast
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

describe('Message deletion', () => {
  it('allows admin to delete a message', async () => {
    const admin = await connectClient(env.port, 'admin-user', { isAdmin: true });
    admin.emit('join-global-chat');
    await waitForEvent(admin, 'chat-history');

    // Send a message first
    const chatP = waitForEvent(admin, 'chat');
    admin.emit('send', { lobby: 'global', message: 'to be deleted' });
    const msg = await chatP;

    // Delete it
    const deleteP = waitForEvent(admin, 'chat-message-deleted');
    const ackP = new Promise((resolve) => {
      admin.emit('delete-global-chat-message', { id: msg.id }, resolve);
    });

    const [deleted, ack] = await Promise.all([deleteP, ackP]);
    expect(deleted.id).toBe(msg.id);
    expect(ack.ok).toBe(true);
    expect(ack.removedId).toBe(msg.id);

    // Verify removed from DB
    const dbMsg = await env.chatCol.findOne({ id: msg.id });
    expect(dbMsg).toBeNull();

    admin.disconnect();
  });

  it('allows protocodex user to delete messages', async () => {
    const proto = await connectClient(env.port, 'protocodex');
    proto.emit('join-global-chat');
    await waitForEvent(proto, 'chat-history');

    const chatP = waitForEvent(proto, 'chat');
    proto.emit('send', { lobby: 'global', message: 'proto delete test' });
    const msg = await chatP;

    const ack = await new Promise((resolve) => {
      proto.emit('delete-global-chat-message', { id: msg.id }, resolve);
    });
    expect(ack.ok).toBe(true);

    const dbMsg = await env.chatCol.findOne({ id: msg.id });
    expect(dbMsg).toBeNull();

    proto.disconnect();
  });

  it('rejects deletion from non-admin, non-protocodex users', async () => {
    // Admin sends a message
    const admin = await connectClient(env.port, 'admin-user', { isAdmin: true });
    admin.emit('join-global-chat');
    await waitForEvent(admin, 'chat-history');

    const chatP = waitForEvent(admin, 'chat');
    admin.emit('send', { lobby: 'global', message: 'admin msg' });
    const msg = await chatP;

    // Regular user tries to delete
    const regular = await connectClient(env.port, 'normie');
    regular.emit('join-global-chat');
    await waitForEvent(regular, 'chat-history');

    const ack = await new Promise((resolve) => {
      regular.emit('delete-global-chat-message', { id: msg.id }, resolve);
    });
    expect(ack.ok).toBe(false);
    expect(ack.error).toBe('unauthorized');

    // Message should still exist
    const dbMsg = await env.chatCol.findOne({ id: msg.id });
    expect(dbMsg).not.toBeNull();

    admin.disconnect();
    regular.disconnect();
  });

  it('broadcasts chat-message-deleted to all clients in the room', async () => {
    const admin = await connectClient(env.port, 'admin2', { isAdmin: true });
    const viewer = await connectClient(env.port, 'viewer');

    admin.emit('join-global-chat');
    viewer.emit('join-global-chat');
    await waitForEvent(admin, 'chat-history');
    await waitForEvent(viewer, 'chat-history');

    // Admin sends and deletes
    const chatP = waitForEvent(admin, 'chat');
    admin.emit('send', { lobby: 'global', message: 'soon gone' });
    const msg = await chatP;
    // Wait for viewer to also receive the chat message
    await delay(100);

    const viewerDeleteP = waitForEvent(viewer, 'chat-message-deleted');
    admin.emit('delete-global-chat-message', { id: msg.id });
    const deleted = await viewerDeleteP;

    expect(deleted.id).toBe(msg.id);

    admin.disconnect();
    viewer.disconnect();
  });

  it('returns not_found for non-existent message ID', async () => {
    const admin = await connectClient(env.port, 'admin3', { isAdmin: true });
    admin.emit('join-global-chat');
    await waitForEvent(admin, 'chat-history');

    const ack = await new Promise((resolve) => {
      admin.emit('delete-global-chat-message', { id: 'fake-id-12345' }, resolve);
    });
    expect(ack.ok).toBe(false);
    expect(ack.error).toBe('not_found');

    admin.disconnect();
  });

  it('returns missing_id when no ID is provided', async () => {
    const admin = await connectClient(env.port, 'admin4', { isAdmin: true });
    admin.emit('join-global-chat');
    await waitForEvent(admin, 'chat-history');

    const ack = await new Promise((resolve) => {
      admin.emit('delete-global-chat-message', {}, resolve);
    });
    expect(ack.ok).toBe(false);
    expect(ack.error).toBe('missing_id');

    admin.disconnect();
  });
});
