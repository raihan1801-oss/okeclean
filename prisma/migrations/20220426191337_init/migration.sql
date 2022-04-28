-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_related_by_user_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "related_by_user" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_related_by_user_fkey" FOREIGN KEY ("related_by_user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
