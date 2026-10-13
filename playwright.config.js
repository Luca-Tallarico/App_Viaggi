import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir:'./tests/browser',
  fullyParallel:true,
  workers:2,
  timeout:30000,
  reporter:'list',
  use:{
    baseURL:'http://127.0.0.1:5173',
    viewport:{width:1440,height:1000},
    launchOptions:{executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']},
    screenshot:'only-on-failure',
  },
  webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
});
