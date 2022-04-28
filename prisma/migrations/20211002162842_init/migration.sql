/*
  Warnings:

  - You are about to drop the column `name` on the `ChatChannel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatChannel" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "ChatNode" ADD COLUMN     "chatNodeId" INTEGER,
ADD COLUMN     "group" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ChatNode" ADD CONSTRAINT "ChatNode_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
