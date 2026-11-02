import { test, expect } from '@playwright/test'
import { ADMIN, expectNotice, login, skipAdminIntro } from './helpers'

test('an admin edits the text of an experience and sees it everywhere', async ({ browser }) => {
  const id = Date.now().toString(36)
  const title = `Editable trip ${id}`
  const context = await browser.newContext()
  await skipAdminIntro(context)
  const page = await context.newPage()
  await login(page, ADMIN.email, ADMIN.password)
  await expect(page).toHaveURL(/admin/)

  await page.goto('/admin/experiences')
  await page.getByRole('button', { name: 'Add new experience' }).click()
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill(title)
  await page.getByRole('textbox', { name: 'Content', exact: true }).fill('First version of the text.')
  await page.getByRole('combobox', { name: 'Category' }).selectOption('Ocio')
  await page.getByRole('button', { name: 'Add Experience' }).click()
  await expectNotice(page, 'New Experience added')

  const row = page.getByRole('rowgroup').filter({ hasText: title })
  await row.getByRole('button', { name: 'Edit' }).click()
  await page.getByRole('rowgroup').filter({ has: page.getByRole('textbox', { name: 'Content' }) }).getByRole('textbox', { name: 'Content' }).fill('Second version of the text.')
  await page.getByRole('button', { name: 'Save' }).click()
  await expectNotice(page, 'Experience updated')

  await expect(row).toContainText('Second version of the text.')
  await page.reload()
  await expect(page.getByRole('rowgroup').filter({ hasText: title })).toContainText('Second version of the text.')

  await page.goto('/experiences')
  await page.getByPlaceholder(/Search by title/).fill(title)
  const card = page.locator('.card').filter({ hasText: title })
  await expect(card).toContainText('Second version of the text.')
  await card.getByRole('link').first().click()
  await expect(page.locator('.content_desc')).toHaveText('Second version of the text.')
})
