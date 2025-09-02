import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://192.168.0.30:8081',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // 👇 slow down each step by 1 second
  workers: 1,
  timeout: 60000,
  fullyParallel: false,
  reporter: [['html', { open: 'never' }], ['list']],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', launchOptions: { slowMo: 500 } },
    },
  ],
});
