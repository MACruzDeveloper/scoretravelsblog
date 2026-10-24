import { test, expect } from '@playwright/test'
import { ADMIN, expectNotice, login, newUser, register, skipAdminIntro } from './helpers'

test('a user submits an experience, the admin publishes it and it can be voted and commented', async ({ browser }) => {
  const traveler = newUser()
  const title = `Sunset over the bay ${traveler.username}`

  const userContext = await browser.newContext()
  const adminContext = await browser.newContext()
  await Promise.all([skipAdminIntro(userContext), skipAdminIntro(adminContext)])
  const user = await userContext.newPage()
  const admin = await adminContext.newPage()

  await test.step('a new user registers and is signed in', async () => {
    await register(user, traveler)
    await expect(user).toHaveURL('/')
    await expect(user.getByRole('link', { name: 'My experiences' })).toBeVisible()
  })

  await test.step('the user submits an experience, which waits for review', async () => {
    await user.getByRole('link', { name: 'My experiences' }).click()
    await user.getByRole('button', { name: 'Add new experience' }).click()
    await user.getByRole('textbox', { name: 'Title', exact: true }).fill(title)
    await user.getByRole('textbox', { name: 'Content', exact: true }).fill('Golden light, fresh fish and a long walk by the water.')
    await user.getByRole('combobox', { name: 'Category' }).selectOption('Ocio')
    await user.getByRole('button', { name: 'Add Experience' }).click()

    await expectNotice(user, 'Experience sent for review')
    const row = user.getByRole('row').filter({ hasText: title })
    await expect(row).toContainText('Pending review')
  })

  await test.step('the public cannot see it yet', async () => {
    await user.goto(`/search?search=${encodeURIComponent(title)}`)
    await expect(user.getByText(`No Results for ${title}`)).toBeVisible()
  })

  await test.step('the admin publishes it from the moderation queue', async () => {
    await login(admin, ADMIN.email, ADMIN.password)
    await expect(admin).toHaveURL(/\/admin/)
    await admin.getByRole('link', { name: /Moderation/ }).click()

    const item = admin.locator('.moderation_item').filter({ hasText: title })
    await expect(item).toContainText(`by ${traveler.username}`)
    await item.getByRole('button', { name: /Publish/ }).click()
    await expectNotice(admin, `"${title}" published`)
  })

  await test.step('it is public now and can be voted and commented', async () => {
    await user.goto(`/search?search=${encodeURIComponent(title)}`)
    await user.getByRole('link', { name: title }).click()
    await expect(user.getByRole('heading', { name: title })).toBeVisible()

    await user.getByRole('button', { name: 'Score 4 out of 5' }).click()
    await expectNotice(user, 'Score added!')
    await expect(user.locator('.content_top .score')).toHaveText('4/5')

    await user.getByRole('textbox', { name: 'Comment' }).fill('Great sunsets, go at 8 pm!')
    await user.getByRole('button', { name: 'Add comment' }).click()
    await expectNotice(user, 'Comment added!')
    await expect(user.locator('.comments_module')).toContainText('Great sunsets, go at 8 pm!')
    await expect(user.locator('.comments_module')).toContainText(traveler.username)
  })

  await Promise.all([userContext.close(), adminContext.close()])
})
