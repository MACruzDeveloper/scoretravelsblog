import { defineConfig, devices } from '@playwright/test'

// End-to-end tests against a real server with an in-memory database (server/tests/e2e-server.js)
const PORT = 4173
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  // The flows share one database, so they run one after another
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Build the client for the e2e server, then start it
    command: 'npm run e2e:build && npm --prefix ../server run e2e:server',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
