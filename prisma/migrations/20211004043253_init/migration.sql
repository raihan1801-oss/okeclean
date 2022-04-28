/*
  Warnings:

  - Added the required column `chatNodeId` to the `BuyerAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BuyerAddress" ADD COLUMN     "chatNodeId" INTEGER NOT NULL;
