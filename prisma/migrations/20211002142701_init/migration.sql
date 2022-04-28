/*
  Warnings:

  - You are about to drop the column `buyerId` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the column `courierId` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the column `internalId` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `ChatNode` table. All the data in the column will be lost.
  - Added the required column `chatNodeId` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatNodeId` to the `Courier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatNodeId` to the `Internal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatNodeId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_courierId_fkey";

-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_internalId_fkey";

-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_storeId_fkey";

-- AlterTable
ALTER TABLE "Buyer" ADD COLUMN     "chatNodeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ChatNode" DROP COLUMN "buyerId",
DROP COLUMN "courierId",
DROP COLUMN "internalId",
DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "Courier" ADD COLUMN     "chatNodeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Internal" ADD COLUMN     "chatNodeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "chatNodeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Internal" ADD CONSTRAINT "Internal_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Courier" ADD CONSTRAINT "Courier_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
