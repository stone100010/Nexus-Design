import { expect,test } from '@playwright/test'

test.describe('AI Generation', () => {
  test('ai page loads', async ({ page }) => {
    await page.goto('/design/ai')
    await page.waitForTimeout(1000)
    const url = page.url()
    expect(url.includes('/design/ai') || url.includes('/auth')).toBe(true)
  })
})
