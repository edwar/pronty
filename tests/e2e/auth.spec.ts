import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('should redirect to login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login|.*dashboard/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation error with empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    // Browser native validation or app validation
    await expect(page.locator('input[type="email"]')).toBeFocused()
  })

  test('should show error with wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Credenciales incorrectas').or(page.locator('text=Error'))).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Crear cuenta')
    await expect(page).toHaveURL(/.*register/)
  })

  test('should show register form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
