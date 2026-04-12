import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './flows',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3099',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'cd ../.. && MONGODB_DATABASE=ag_test npm run dev -- -p 3099',
    port: 3099,
    reuseExistingServer: true,
    timeout: 90000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
