/*
  Warnings:

  - You are about to drop the column `readOn` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `receiveOn` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `sentOn` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `stackId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `ChatNode` table. All the data in the column will be lost.
  - You are about to drop the `ChatMessageStack` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatNodeId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentAt` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentById` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_stackId_fkey";

-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_messageId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "readOn",
DROP COLUMN "receiveOn",
DROP COLUMN "sentOn",
DROP COLUMN "stackId",
ADD COLUMN     "channelId" INTEGER,
ADD COLUMN     "chatNodeId" INTEGER NOT NULL,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "receiveAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sentById" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ChatNode" DROP COLUMN "createAt",
DROP COLUMN "messageId";

-- DropTable
DROP TABLE "ChatMessageStack";

-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatChannelToChatNode" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatChannelToChatNode_AB_unique" ON "_ChatChannelToChatNode"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatChannelToChatNode_B_index" ON "_ChatChannelToChatNode"("B");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToChatNode" ADD FOREIGN KEY ("A") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToChatNode" ADD FOREIGN KEY ("B") REFERENCES "ChatNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
