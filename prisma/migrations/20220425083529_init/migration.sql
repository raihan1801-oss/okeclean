-- AlterTable
ALTER TABLE "Feature" ALTER COLUMN "meta" SET DEFAULT E'{}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "image" SET DEFAULT E'',
ALTER COLUMN "sex" SET DEFAULT E'',
ALTER COLUMN "verified" SET DEFAULT false,
ALTER COLUMN "multi_auth" SET DEFAULT false,
ALTER COLUMN "access" SET DEFAULT E'{}';
