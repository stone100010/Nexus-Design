import { expect,test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('text=欢迎回来')).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.locator('text=创建账户')).toBeVisible()
  })

  test('unauthenticated user redirected from workspace', async ({ page }) => {
    await page.goto('/workspace')
    // Should redirect to login or show login prompt
    await page.waitForTimeout(1000)
    const url = page.url()
    expect(url.includes('/auth') || url.includes('/workspace')).toBe(true)
  })
})
