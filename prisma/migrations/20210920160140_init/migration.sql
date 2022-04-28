-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;
