/*
  Warnings:

  - Made the column `chatNodeId` on table `Internal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Internal" DROP CONSTRAINT "Internal_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "Internal" ALTER COLUMN "chatNodeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Internal" ADD CONSTRAINT "Internal_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
