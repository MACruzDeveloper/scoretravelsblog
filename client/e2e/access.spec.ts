import { test, expect } from '@playwright/test'
import { newUser, register, skipAdminIntro } from './helpers'

test('the admin panel asks for a session', async ({ page }) => {
  await page.goto('/admin/experiences')
  await expect(page).toHaveURL('/login')
})

test('regular users only manage their own experiences', async ({ page, context }) => {
  await skipAdminIntro(context)
  await register(page, newUser())
  await expect(page).toHaveURL('/')

  await page.goto('/admin/experiences')
  await expect(page.getByRole('heading', { name: 'My experiences' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Moderation/ })).toHaveCount(0)

  await page.goto('/admin/users')
  await expect(page.getByText('This section is only available to administrators.')).toBeVisible()
})

test('forms explain what is wrong before sending', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.getByText('Password must have at least 8 characters')).toBeVisible()
})
