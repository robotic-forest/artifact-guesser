/**
 * Tests: Authentication flow (signup, login, logout, session persistence)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectToTestEnv, disconnectTestEnv, createUser, loginUser, authGet, authPost } from '../helpers/api-env.js';
import { clearAllCollections } from '../helpers/seed.js';

let baseUrl, db, mongoClient;

beforeAll(async () => {
  ({ baseUrl, db, mongoClient } = await connectToTestEnv());
});

afterAll(async () => {
  await disconnectTestEnv(mongoClient);
});

beforeEach(async () => {
  await clearAllCollections(db);
});

describe('Signup', () => {
  it('creates a new account and returns session cookie', async () => {
    const user = await createUser(baseUrl, {
      email: 'alice@test.com',
      username: 'alice',
      password: 'StrongPass1!',
    });

    expect(user.body.success).toBe(true);
    expect(user.cookie).toBeTruthy();

    const { data } = await authGet(baseUrl, '/api/user', user.cookie);
    expect(data.isLoggedIn).toBe(true);
    expect(data.username).toBe('alice');
  });

  it('rejects duplicate email', async () => {
    await createUser(baseUrl, { email: 'dupe@test.com', username: 'first' });
    const second = await createUser(baseUrl, { email: 'dupe@test.com', username: 'second' });

    expect(second.body.success).toBe(false);
  });

  it('rejects duplicate username', async () => {
    await createUser(baseUrl, { email: 'a@test.com', username: 'samename' });
    const second = await createUser(baseUrl, { email: 'b@test.com', username: 'samename' });

    expect(second.body.success).toBe(false);
  });
});

describe('Login', () => {
  it('logs in with correct credentials', async () => {
    await createUser(baseUrl, {
      email: 'bob@test.com',
      username: 'bob',
      password: 'BobPass1!',
    });

    const login = await loginUser(baseUrl, 'bob', 'BobPass1!');
    expect(login.body.success).toBe(true);
    expect(login.cookie).toBeTruthy();
  });

  it('logs in with email (case insensitive)', async () => {
    await createUser(baseUrl, {
      email: 'Bob@Test.com',
      username: 'bobby',
      password: 'BobPass1!',
    });

    const login = await loginUser(baseUrl, 'bob@test.com', 'BobPass1!');
    expect(login.body.success).toBe(true);
  });

  it('rejects wrong password', async () => {
    await createUser(baseUrl, {
      email: 'charlie@test.com',
      username: 'charlie',
      password: 'RightPass1!',
    });

    const login = await loginUser(baseUrl, 'charlie', 'WrongPass!');
    expect(login.body.success).toBe(false);
  });

  it('rejects nonexistent user', async () => {
    const login = await loginUser(baseUrl, 'nobody', 'NoPass1!');
    expect(login.body.success).toBe(false);
  });
});

describe('Session', () => {
  it('persists across multiple requests', async () => {
    const user = await createUser(baseUrl, {
      email: 'session@test.com',
      username: 'sessionuser',
    });

    const r1 = await authGet(baseUrl, '/api/user', user.cookie);
    const r2 = await authGet(baseUrl, '/api/user', user.cookie);

    expect(r1.data.isLoggedIn).toBe(true);
    expect(r2.data.isLoggedIn).toBe(true);
    expect(r1.data.username).toBe('sessionuser');
  });

  it('returns isLoggedIn:false without cookie', async () => {
    const res = await fetch(`${baseUrl}/api/user`);
    const data = await res.json();

    expect(data.isLoggedIn).toBe(false);
  });
});

describe('Logout', () => {
  it('destroys session', async () => {
    const user = await createUser(baseUrl, {
      email: 'logout@test.com',
      username: 'logoutuser',
    });

    const logoutRes = await authPost(baseUrl, '/api/logout', {}, user.cookie);
    expect(logoutRes.data.success).toBe(true);

    const newCookie = logoutRes.headers.get('set-cookie');
    if (newCookie) {
      const { data } = await authGet(baseUrl, '/api/user', newCookie);
      expect(data.isLoggedIn).toBe(false);
    }
  });
});

describe('Protected routes', () => {
  it('rejects unauthenticated access to /api/games/current', async () => {
    const res = await fetch(`${baseUrl}/api/games/current`);
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated access to /api/accounts/edit', async () => {
    const res = await fetch(`${baseUrl}/api/accounts/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'hacker' }),
    });
    expect(res.status).toBe(401);
  });
});
