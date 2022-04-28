/*
  Warnings:

  - You are about to drop the column `chatNodeId` on the `ChatNode` table. All the data in the column will be lost.
  - Added the required column `name` to the `ChatNode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatNode" DROP CONSTRAINT "ChatNode_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "ChatNode" DROP COLUMN "chatNodeId",
ADD COLUMN     "name" TEXT NOT NULL;
