/*
  Warnings:

  - Made the column `productId` on table `SelectedItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SelectedItem" DROP CONSTRAINT "SelectedItem_productId_fkey";

-- AlterTable
ALTER TABLE "SelectedItem" ALTER COLUMN "productId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SelectedItem" ADD CONSTRAINT "SelectedItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
