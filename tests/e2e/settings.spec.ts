import { test, expect } from '@playwright/test'

test.describe('Admin Settings', () => {
  test('should show settings page for admin', async ({ page }) => {
    test.skip(true, 'Requires admin authentication')
    
    await page.goto('/admin/settings')
    await expect(page.locator('text=Configuración')).toBeVisible()
  })

  test('should show WhatsApp settings section', async ({ page }) => {
    test.skip(true, 'Requires admin authentication')
    
    await page.goto('/admin/settings')
    await expect(page.locator('text=WhatsApp Business')).toBeVisible()
  })

  test('should show delivery pricing section', async ({ page }) => {
    test.skip(true, 'Requires admin authentication')
    
    await page.goto('/admin/settings')
    await expect(page.locator('text=Tarifas de Domicilio')).toBeVisible()
  })

  test('should show credits section', async ({ page }) => {
    test.skip(true, 'Requires admin authentication')
    
    await page.goto('/admin/settings')
    await expect(page.locator('text=Créditos')).toBeVisible()
  })

  test('should save settings', async ({ page }) => {
    test.skip(true, 'Requires admin authentication')
    
    await page.goto('/admin/settings')
    await page.click('text=Guardar')
    await expect(page.locator('text=Configuración guardada')).toBeVisible({ timeout: 5000 })
  })
})
