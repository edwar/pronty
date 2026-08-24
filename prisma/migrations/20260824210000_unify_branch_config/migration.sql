-- AlterTable: Remove location fields from Commerce (now in Branch)
ALTER TABLE "commerces" DROP COLUMN "address";
ALTER TABLE "commerces" DROP COLUMN "city";
ALTER TABLE "commerces" DROP COLUMN "lat";
ALTER TABLE "commerces" DROP COLUMN "lng";

-- AlterTable: Add config fields to Branch
ALTER TABLE "branches" ADD COLUMN "orderPrefix" TEXT NOT NULL DEFAULT 'ORD';
ALTER TABLE "branches" ADD COLUMN "workingHours" JSONB NOT NULL DEFAULT '{"monday":{"open":"08:00","close":"20:00","active":true},"tuesday":{"open":"08:00","close":"20:00","active":true},"wednesday":{"open":"08:00","close":"20:00","active":true},"thursday":{"open":"08:00","close":"20:00","active":true},"friday":{"open":"08:00","close":"20:00","active":true},"saturday":{"open":"09:00","close":"18:00","active":true},"sunday":{"open":"09:00","close":"14:00","active":false}}';
