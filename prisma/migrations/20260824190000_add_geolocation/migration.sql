-- AlterTable: Add geolocation fields to Commerce
ALTER TABLE "commerces" ADD COLUMN "city" TEXT;
ALTER TABLE "commerces" ADD COLUMN "lat" DECIMAL(10, 8);
ALTER TABLE "commerces" ADD COLUMN "lng" DECIMAL(11, 8);

-- AlterTable: Replace zone with city in Driver
ALTER TABLE "drivers" DROP COLUMN "zone";
ALTER TABLE "drivers" ADD COLUMN "city" TEXT;

-- AlterTable: Add distanceKm to Order
ALTER TABLE "orders" ADD COLUMN "distanceKm" DECIMAL(8, 2);

-- AlterTable: Replace zone with city in DriverGroup
ALTER TABLE "driver_groups" DROP COLUMN "zone";
ALTER TABLE "driver_groups" ADD COLUMN "city" TEXT;

-- CreateIndex
CREATE INDEX "commerces_city_idx" ON "commerces"("city");
CREATE INDEX "drivers_city_idx" ON "drivers"("city");
