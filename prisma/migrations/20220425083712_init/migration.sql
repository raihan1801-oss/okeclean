-- DropIndex
DROP INDEX "User_telp_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "telp" SET DEFAULT E'';
