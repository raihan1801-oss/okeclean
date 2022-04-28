-- DropForeignKey
ALTER TABLE "Buyer" DROP CONSTRAINT "Buyer_chatNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Courier" DROP CONSTRAINT "Courier_chatNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Internal" DROP CONSTRAINT "Internal_chatNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_chatNodeId_fkey";

-- AlterTable
ALTER TABLE "Buyer" ALTER COLUMN "chatNodeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ChatNode" ADD COLUMN     "desc" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Courier" ALTER COLUMN "chatNodeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Internal" ALTER COLUMN "chatNodeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "chatNodeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Internal" ADD CONSTRAINT "Internal_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Courier" ADD CONSTRAINT "Courier_chatNodeId_fkey" FOREIGN KEY ("chatNodeId") REFERENCES "ChatNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
