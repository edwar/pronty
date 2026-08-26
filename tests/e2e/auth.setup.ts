import { test as setup, expect } from '@playwright/test'

const adminFile = 'tests/e2e/.auth/admin.json'
const commerceFile = 'tests/e2e/.auth/commerce.json'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'edwaramayadiaz@gmail.com')
  await page.fill('input[type="password"]', 'Control2486')
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
  
  // Save authentication state
  await page.context().storageState({ path: adminFile })
})

setup('authenticate as commerce', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'amayadiazedwarorlando@gmail.com')
  await page.fill('input[type="password"]', 'Control2486')
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
  
  // Save authentication state
  await page.context().storageState({ path: commerceFile })
})
