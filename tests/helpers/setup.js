/**
 * Shared test helpers for the AG chat test suite.
 *
 * Spins up:
 *   - MongoMemoryServer  (ephemeral MongoDB)
 *   - A bare Socket.IO server that wires up *only* the chat-related
 *     subset of the real AG socket protocol:
 *       • register-client, join-global-chat, leave-global-chat, send,
 *         delete-global-chat-message, request-older-messages
 *
 * Every handler mirrors the production code in
 *   protocodex-mainframe/artifact-guesser/socket.js
 * so these tests validate the actual DB + event contract the frontend relies on.
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

// ── Unique ID generator (same as production) ────────────────────────
const generateChatId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ── Boot helpers ─────────────────────────────────────────────────────

export async function createTestEnv() {
  // 1. In-memory Mongo
  const mongod = await MongoMemoryServer.create();
  const mongoClient = new MongoClient(mongod.getUri());
  await mongoClient.connect();
  const db = mongoClient.db('ag_test');
  const chatCol = db.collection('chat_messages');
  await chatCol.createIndex({ lobby: 1, timestamp: -1 });
  await chatCol.createIndex({ id: 1 }, { unique: true });

  // 2. HTTP + Socket.IO server
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  const CHAT_PAGE_SIZE = 50;
  const GLOBAL_CHAT_ROOM = 'global_chat_room';
  const clients = {};

  // ── DB helpers (same as production) ──────────────────────────────
  const insertChatMessage = async (msg) => {
    await chatCol.insertOne(msg);
    return msg;
  };

  const getChatPage = async (lobby, beforeTimestamp = null, limit = CHAT_PAGE_SIZE) => {
    const query = { lobby };
    if (beforeTimestamp) query.timestamp = { $lt: beforeTimestamp };
    const msgs = await chatCol.find(query).sort({ timestamp: -1 }).limit(limit).toArray();
    return msgs.reverse();
  };

  const deleteChatMessageById = async (id, lobby) => {
    return chatCol.deleteOne({ id, lobby });
  };

  // ── Email notification stubs ─────────────────────────────────────
  const emailsSent = [];
  const PROTOCODEX_EMAIL = 'sasnow62@gmail.com';
  const CHAT_EMAIL_DEBOUNCE_MS = 200; // fast for tests
  const CHAT_EMAIL_MAX_WAIT_MS = 500;
  let chatEmailBuffer = [];
  let chatEmailTimer = null;
  let chatEmailBufferStart = null;

  const isProtocodexInGlobalChat = () => {
    for (const [socketId, clientInfo] of Object.entries(clients)) {
      if (clientInfo.username === 'protocodex') {
        const sock = io.sockets.sockets.get(socketId);
        if (sock && sock.rooms.has(GLOBAL_CHAT_ROOM)) return true;
      }
    }
    return false;
  };

  const flushChatEmailBuffer = () => {
    if (chatEmailBuffer.length === 0) return;
    const messages = [...chatEmailBuffer];
    chatEmailBuffer = [];
    chatEmailTimer = null;
    chatEmailBufferStart = null;
    if (isProtocodexInGlobalChat()) return;
    emailsSent.push({
      to: PROTOCODEX_EMAIL,
      subject: `AG Chat: ${messages.length} new message${messages.length > 1 ? 's' : ''}`,
      messages,
    });
  };

  const bufferChatEmailNotification = (msg) => {
    if (isProtocodexInGlobalChat()) return;
    chatEmailBuffer.push(msg);
    if (!chatEmailBufferStart) chatEmailBufferStart = Date.now();
    if (Date.now() - chatEmailBufferStart >= CHAT_EMAIL_MAX_WAIT_MS) {
      if (chatEmailTimer) clearTimeout(chatEmailTimer);
      flushChatEmailBuffer();
      return;
    }
    if (chatEmailTimer) clearTimeout(chatEmailTimer);
    chatEmailTimer = setTimeout(flushChatEmailBuffer, CHAT_EMAIL_DEBOUNCE_MS);
  };

  // ── Socket handlers ──────────────────────────────────────────────
  io.on('connection', (socket) => {
    socket.on('register-client', (data) => {
      clients[socket.id] = {
        userId: data.userId,
        username: data.username,
        isAdmin: data.isAdmin || false,
        lobby: null,
      };
      socket.emit('client-registered', { socketId: socket.id });
    });

    socket.on('join-global-chat', async () => {
      const clientInfo = clients[socket.id];
      if (!clientInfo) return;
      socket.join(GLOBAL_CHAT_ROOM);
      const history = await getChatPage('global');
      socket.emit('chat-history', {
        messages: history,
        hasMore: history.length === CHAT_PAGE_SIZE,
      });
    });

    socket.on('leave-global-chat', () => {
      socket.leave(GLOBAL_CHAT_ROOM);
    });

    socket.on('send', async (data) => {
      const clientData = clients[socket.id];
      if (!clientData || !data?.message?.trim() || !data?.lobby) return;

      const sanitized = data.message.trim();
      const targetLobby = data.lobby;

      if (targetLobby === 'global') {
        const msg = {
          username: clientData.username,
          message: sanitized,
          lobby: 'global',
          timestamp: Date.now(),
          id: generateChatId(),
        };
        await insertChatMessage(msg);
        io.to(GLOBAL_CHAT_ROOM).emit('chat', msg);
        bufferChatEmailNotification(msg);
      }
    });

    socket.on('delete-global-chat-message', async (data, ack) => {
      const clientInfo = clients[socket.id];
      if (!clientInfo) {
        if (ack) ack({ ok: false, error: 'unregistered' });
        return;
      }
      const isAuthorized = clientInfo.isAdmin || clientInfo.username === 'protocodex';
      if (!isAuthorized) {
        if (ack) ack({ ok: false, error: 'unauthorized' });
        return;
      }
      const targetId = data?.id;
      if (!targetId) {
        if (ack) ack({ ok: false, error: 'missing_id' });
        return;
      }
      const result = await deleteChatMessageById(targetId, 'global');
      if (result.deletedCount === 0) {
        if (ack) ack({ ok: false, error: 'not_found' });
        return;
      }
      io.to(GLOBAL_CHAT_ROOM).emit('chat-message-deleted', { id: targetId });
      if (ack) ack({ ok: true, removedId: targetId });
    });

    socket.on('request-older-messages', async ({ lobby, before }, ack) => {
      if (!clients[socket.id]) return;
      const messages = await getChatPage(lobby, before, CHAT_PAGE_SIZE);
      const hasMore = messages.length === CHAT_PAGE_SIZE;
      if (ack) ack({ messages, hasMore });
    });

    socket.on('disconnect', () => {
      delete clients[socket.id];
    });
  });

  // 3. Start listening on a random port
  await new Promise((resolve) => httpServer.listen(0, resolve));
  const port = httpServer.address().port;

  return {
    io,
    httpServer,
    port,
    db,
    chatCol,
    mongod,
    mongoClient,
    clients,
    emailsSent,
    flushChatEmailBuffer,
    CHAT_PAGE_SIZE,
  };
}

// ── Client factory ───────────────────────────────────────────────────

export function connectClient(port, username, opts = {}) {
  const socket = ioClient(`http://localhost:${port}`, {
    transports: ['websocket'],
    forceNew: true,
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.emit('register-client', {
        userId: opts.userId || username,
        username,
        isAdmin: opts.isAdmin || false,
      });
      socket.on('client-registered', () => resolve(socket));
    });
  });
}

// ── Teardown ─────────────────────────────────────────────────────────

export async function destroyTestEnv(env) {
  env.io.disconnectSockets(true);
  env.io.close();
  env.httpServer.close();
  await env.mongoClient.close();
  await env.mongod.stop();
}

// ── Utility: wait for a specific event with timeout ──────────────────

export function waitForEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for "${event}"`)),
      timeoutMs,
    );
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// ── Utility: small delay ─────────────────────────────────────────────

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
