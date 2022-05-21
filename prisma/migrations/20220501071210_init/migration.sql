/*
  Warnings:

  - You are about to drop the `_ChatChannelToChatNode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatChannelToChatNode" DROP CONSTRAINT "_ChatChannelToChatNode_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatChannelToChatNode" DROP CONSTRAINT "_ChatChannelToChatNode_B_fkey";

-- DropForeignKey
ALTER TABLE "_recipient" DROP CONSTRAINT "_recipient_B_fkey";

-- DropTable
DROP TABLE "_ChatChannelToChatNode";

-- CreateTable
CREATE TABLE "_ChatChannelToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatChannelToUser_AB_unique" ON "_ChatChannelToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatChannelToUser_B_index" ON "_ChatChannelToUser"("B");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToUser" ADD CONSTRAINT "_ChatChannelToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatChannelToUser" ADD CONSTRAINT "_ChatChannelToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_recipient" ADD CONSTRAINT "_recipient_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
