import { expect, type BrowserContext, type Page } from '@playwright/test'

// Seeded by server/tests/e2e-server.js
export const ADMIN = { email: 'admin@e2e.dev', password: 'supersecret1' }

// Unique per run, so reruns against a reused server do not collide
export const newUser = () => {
  const id = Date.now().toString(36)
  return { username: `traveler${id}`, email: `traveler${id}@e2e.dev`, password: 'supersecret1' }
}

// The admin panel shows a 4 s intro animation once per session; skip it
export const skipAdminIntro = async (context: BrowserContext) => {
  await context.addInitScript(() => sessionStorage.setItem('adminCurtainShown', 'true'))
}

// Waits for a notice and closes it (it covers the page while visible)
export const expectNotice = async (page: Page, text: string | RegExp) => {
  const notice = page.locator('.modal.on')
  await expect(notice).toContainText(text)
  await notice.click()
  await expect(notice).toHaveCount(0)
}

export const register = async (page: Page, user: ReturnType<typeof newUser>) => {
  await page.goto('/register')
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByLabel('Confirm password').fill(user.password)
  await page.getByRole('button', { name: 'Register' }).click()
}

export const login = async (page: Page, email: string, password: string) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}
