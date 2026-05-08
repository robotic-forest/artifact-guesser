import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './flows',
  timeout: 60000,
  retries: 0,
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  use: {
    baseURL: 'http://localhost:3099',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // Server lifecycle handled by global-setup/teardown so we share the
  // Next.js + MongoMemoryServer harness with the Vitest API tests.
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
