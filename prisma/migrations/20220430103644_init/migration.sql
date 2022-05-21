-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_created_by_user_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_related_by_user_fkey";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_created_by_user_fkey" FOREIGN KEY ("created_by_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_related_by_user_fkey" FOREIGN KEY ("related_by_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
