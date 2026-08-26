import { test, expect } from '@playwright/test'

test.describe('Admin Settings', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' })

  test('should show settings page', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.locator('text=Configuración')).toBeVisible()
  })

  test('should show WhatsApp settings section', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.locator('text=WhatsApp Business')).toBeVisible()
  })

  test('should show delivery pricing section', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.locator('text=Tarifas de Domicilio')).toBeVisible()
  })

  test('should show credits section', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.locator('text=Créditos')).toBeVisible()
  })
})

test.describe('Commerce Settings', () => {
  test.use({ storageState: 'tests/e2e/.auth/commerce.json' })

  test('should show settings page', async ({ page }) => {
    await page.goto('/settings/commercant')
    await expect(page.locator('text=Configuración')).toBeVisible()
  })

  test('should show branches section', async ({ page }) => {
    await page.goto('/settings/commercant')
    await expect(page.locator('text=Sucursales')).toBeVisible()
  })
})
