-- AlterTable
ALTER TABLE "Buyer" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- RenameIndex
ALTER INDEX "Cart_buyerId_unique" RENAME TO "Cart_buyerId_key";

-- RenameIndex
ALTER INDEX "Order_deliveryId_unique" RENAME TO "Order_deliveryId_key";

-- RenameIndex
ALTER INDEX "Rating_orderId_unique" RENAME TO "Rating_orderId_key";
