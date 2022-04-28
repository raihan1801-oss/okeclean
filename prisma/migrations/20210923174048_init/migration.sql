/*
  Warnings:

  - You are about to drop the column `arriveOn` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the column `telp` on the `Seller` table. All the data in the column will be lost.
  - Added the required column `telp` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "arriveOn",
ADD COLUMN     "receiveOn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "telp";

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "telp" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChatNode" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "internalId" INTEGER,
    "buyerId" INTEGER,
    "storeId" INTEGER,
    "courierId" INTEGER,
    "chatNodeId" INTEGER,

    CONSTRAINT "ChatNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageStack" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ChatMessageStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sentOn" TIMESTAMP(3) NOT NULL,
    "receiveOn" TIMESTAMP(3),
    "readOn" TIMESTAMP(3),
    "image" TEXT,
    "text" TEXT NOT NULL,
    "stackId" INTEGER,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessageStack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_internalId_fkey" FOREIGN KEY ("internalId") REFERENCES "Internal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "ChatMessageStack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
