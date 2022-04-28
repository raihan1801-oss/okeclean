/*
  Warnings:

  - You are about to drop the column `name` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `created_by_user` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `related_by_user` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transaction_name_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "name",
ADD COLUMN     "created_by_user" INTEGER NOT NULL,
ADD COLUMN     "related_by_user" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_created_by_user_fkey" FOREIGN KEY ("created_by_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_related_by_user_fkey" FOREIGN KEY ("related_by_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
