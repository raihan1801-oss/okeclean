/*
  Warnings:

  - You are about to drop the column `addressId` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `arrivedAt` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Order` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_addressId_fkey";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "addressId",
DROP COLUMN "arrivedAt",
DROP COLUMN "deliveredAt",
ADD COLUMN     "arriveOn" TIMESTAMP(3),
ADD COLUMN     "recipientId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL,
ADD COLUMN     "sentOn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address",
DROP COLUMN "position",
ADD COLUMN     "createOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "finishOn" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "BuyerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
