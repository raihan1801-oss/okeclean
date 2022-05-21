/*
  Warnings:

  - You are about to drop the `_ChatChannelToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatChannelToUser" DROP CONSTRAINT "_ChatChannelToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatChannelToUser" DROP CONSTRAINT "_ChatChannelToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_recipient" DROP CONSTRAINT "_recipient_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chat_node_id" INTEGER;

-- DropTable
DROP TABLE "_ChatChannelToUser";

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
ALTER TABLE "User" ADD CONSTRAINT "User_chat_node_id_fkey" FOREIGN KEY ("chat_node_id") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToChatNode" ADD CONSTRAINT "_ChatChannelToChatNode_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToChatNode" ADD CONSTRAINT "_ChatChannelToChatNode_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_recipient" ADD CONSTRAINT "_recipient_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
