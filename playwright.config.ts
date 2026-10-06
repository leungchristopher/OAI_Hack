import { defineConfig } from '@playwright/test';
const remoteBase=process.env.E2E_BASE_URL;
export default defineConfig({testDir:'./e2e',fullyParallel:false,use:{baseURL:remoteBase||'http://127.0.0.1:5173',viewport:{width:1440,height:1000},trace:'retain-on-failure'},webServer:remoteBase?undefined:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:true,timeout:30000},reporter:'list'});
