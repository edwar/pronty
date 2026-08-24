-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "lat" DECIMAL(10, 8),
    "lng" DECIMAL(11, 8),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "branchId" TEXT;

-- CreateIndex
CREATE INDEX "branches_commerceId_isActive_idx" ON "branches"("commerceId", "isActive");

-- CreateIndex
CREATE INDEX "orders_branchId_idx" ON "orders"("branchId");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
