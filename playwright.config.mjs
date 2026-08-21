import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'.',
  timeout:30000,
  workers:process.env.CI?1:undefined,
  fullyParallel:false,
  use:{
    serviceWorkers:'block',
    navigationTimeout:15000,
    actionTimeout:10000,
    trace:'retain-on-failure'
  }
});
