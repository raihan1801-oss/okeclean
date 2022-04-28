/*
  Warnings:

  - You are about to drop the column `chatNodeId` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "chatNodeId";

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
