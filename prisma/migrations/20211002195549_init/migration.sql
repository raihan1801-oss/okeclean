/*
  Warnings:

  - You are about to drop the column `chatNodeId` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `ChatNode` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChatChannelType" AS ENUM ('PerToPer', 'PerToGroup');

-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "ChatChannel" ADD COLUMN     "type" "ChatChannelType" NOT NULL DEFAULT E'PerToPer';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "replyForId" INTEGER;

-- AlterTable
ALTER TABLE "ChatNode" DROP COLUMN "chatNodeId",
DROP COLUMN "group",
ADD COLUMN     "type" "ChatChannelType" NOT NULL DEFAULT E'PerToPer';

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyForId_fkey" FOREIGN KEY ("replyForId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
