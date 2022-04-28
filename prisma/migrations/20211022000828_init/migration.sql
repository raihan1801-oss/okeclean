/*
  Warnings:

  - You are about to drop the column `sentById` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Made the column `channelId` on table `ChatMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sentById_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "sentById",
ADD COLUMN     "senderId" INTEGER NOT NULL,
ALTER COLUMN "channelId" SET NOT NULL,
ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" SERIAL NOT NULL,
    "nodeId" INTEGER NOT NULL,
    "subcription" JSONB NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_recipient" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_recipient_AB_unique" ON "_recipient"("A", "B");

-- CreateIndex
CREATE INDEX "_recipient_B_index" ON "_recipient"("B");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_recipient" ADD FOREIGN KEY ("A") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_recipient" ADD FOREIGN KEY ("B") REFERENCES "ChatNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
