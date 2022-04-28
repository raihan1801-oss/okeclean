/*
  Warnings:

  - Made the column `chatNodeId` on table `Buyer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chatNodeId` on table `Courier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chatNodeId` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Buyer" DROP CONSTRAINT "Buyer_chatNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Courier" DROP CONSTRAINT "Courier_chatNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "Buyer" ALTER COLUMN "chatNodeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Courier" ALTER COLUMN "chatNodeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "chatNodeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Courier" ADD CONSTRAINT "Courier_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
