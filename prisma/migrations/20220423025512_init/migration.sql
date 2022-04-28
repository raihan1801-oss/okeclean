-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "address" JSONB,
    "image" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "multi_auth" BOOLEAN NOT NULL,
    "subscribtion" JSONB,
    "role" TEXT NOT NULL,
    "access" JSONB NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "data" JSONB NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL,
    "finished_on" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telp_key" ON "User"("telp");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "Feature_name_idx" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "Transaction_name_idx" ON "Transaction"("name");
