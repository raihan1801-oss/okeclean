/*
  Warnings:

  - Added the required column `role` to the `Subscriber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Subscriber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;
