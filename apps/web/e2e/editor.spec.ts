import { expect,test } from '@playwright/test'

test.describe('Editor', () => {
  test('editor page loads', async ({ page }) => {
    await page.goto('/design/editor')
    await page.waitForTimeout(1000)
    // Should show editor or redirect to login
    const url = page.url()
    expect(url.includes('/design/editor') || url.includes('/auth')).toBe(true)
  })
})
