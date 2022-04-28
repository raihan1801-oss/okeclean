/*
  Warnings:

  - Added the required column `address` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `buyerId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price` to the `OrderedItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_buyerId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "position" DOUBLE PRECISION[],
ALTER COLUMN "buyerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderedItem" ADD COLUMN     "price" MONEY NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
