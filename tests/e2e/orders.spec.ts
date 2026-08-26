import { test, expect } from '@playwright/test'

test.describe('Orders (Commerce)', () => {
  test.use({ storageState: 'tests/e2e/.auth/commerce.json' })

  test('should show orders page', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.locator('text=Pedidos')).toBeVisible()
  })

  test('should show create order button', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.locator('text=Nuevo Pedido')).toBeVisible()
  })

  test('should open create order dialog', async ({ page }) => {
    await page.goto('/orders')
    await page.click('text=Nuevo Pedido')
    await expect(page.locator('text=Crear Nuevo Pedido')).toBeVisible()
  })

  test('should show filter options', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.locator('text=Todos los estados')).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    await page.goto('/orders')
    await page.click('text=Nuevo Pedido')
    await expect(page.locator('text=Crear Nuevo Pedido')).toBeVisible()
    await page.click('text=Cancelar')
    await expect(page.locator('text=Crear Nuevo Pedido')).not.toBeVisible()
  })
})
