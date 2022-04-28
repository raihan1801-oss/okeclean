-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Queue', 'Process', 'Delivery', 'Confirm', 'Done', 'Archive');

-- CreateTable
CREATE TABLE "Internal" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "access" JSONB NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "telp" TEXT,
    "mfa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Internal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "internalId" INTEGER,

    CONSTRAINT "InternalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "telp" TEXT,
    "sex" TEXT,
    "birthdate" TIMESTAMP(3),
    "image" TEXT,
    "mfa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "buyerId" INTEGER,

    CONSTRAINT "BuyerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerAddress" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL,
    "pinned" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "area" TEXT,
    "local" TEXT,
    "place" TEXT,
    "position" DOUBLE PRECISION[],
    "buyerId" INTEGER,

    CONSTRAINT "BuyerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "position" DOUBLE PRECISION[],
    "image" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "storeId" INTEGER,

    CONSTRAINT "StoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "telp" TEXT,
    "notification" BOOLEAN NOT NULL DEFAULT false,
    "mfa" BOOLEAN NOT NULL DEFAULT false,
    "storeId" INTEGER,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "sellerId" INTEGER,

    CONSTRAINT "SellerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courier" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "telp" TEXT,
    "address" TEXT,
    "area" TEXT,
    "local" TEXT,
    "place" TEXT,
    "position" DOUBLE PRECISION[],
    "image" TEXT,
    "mfa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "courierId" INTEGER,

    CONSTRAINT "CourierHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "buyerId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "cartId" INTEGER,

    CONSTRAINT "CartHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT E'',
    "image" TEXT NOT NULL,
    "price" MONEY NOT NULL,
    "stock" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightUnit" TEXT NOT NULL,
    "fresh" BOOLEAN NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "forSale" BOOLEAN NOT NULL DEFAULT true,
    "storeId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "productId" INTEGER,

    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedItem" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "productId" INTEGER,
    "cartId" INTEGER,

    CONSTRAINT "SelectedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedItem" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "syncronized" BOOLEAN NOT NULL DEFAULT true,
    "selectedItem" JSONB NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "OrderedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupOrder" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT NOT NULL,
    "range" DOUBLE PRECISION NOT NULL,
    "rangeUnit" TEXT NOT NULL,
    "orderCost" MONEY NOT NULL,
    "deliveryCost" MONEY NOT NULL,
    "totalCost" MONEY NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "GroupOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT NOT NULL,
    "cost" MONEY NOT NULL,
    "groupOrderId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "buyerId" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "courierId" INTEGER,
    "status" "OrderStatus" NOT NULL,
    "range" DOUBLE PRECISION NOT NULL,
    "rangeUnit" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT NOT NULL,
    "cost" MONEY NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryHistory" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "deliveryId" INTEGER,

    CONSTRAINT "DeliveryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Internal_username_key" ON "Internal"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Internal_email_key" ON "Internal"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InternalHistory_internalId_key" ON "InternalHistory"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_username_key" ON "Buyer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerHistory_buyerId_key" ON "BuyerHistory"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreHistory_storeId_key" ON "StoreHistory"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_username_key" ON "Seller"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SellerHistory_sellerId_key" ON "SellerHistory"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Courier_username_key" ON "Courier"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Courier_email_key" ON "Courier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourierHistory_courierId_key" ON "CourierHistory"("courierId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_buyerId_unique" ON "Cart"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "CartHistory_cartId_key" ON "CartHistory"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductHistory_productId_key" ON "ProductHistory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_deliveryId_unique" ON "Order"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderHistory_orderId_key" ON "OrderHistory"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryHistory_deliveryId_key" ON "DeliveryHistory"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_orderId_unique" ON "Rating"("orderId");

-- AddForeignKey
ALTER TABLE "InternalHistory" ADD CONSTRAINT "InternalHistory_internalId_fkey" FOREIGN KEY ("internalId") REFERENCES "Internal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerHistory" ADD CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerAddress" ADD CONSTRAINT "BuyerAddress_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreHistory" ADD CONSTRAINT "StoreHistory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerHistory" ADD CONSTRAINT "SellerHistory_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierHistory" ADD CONSTRAINT "CourierHistory_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartHistory" ADD CONSTRAINT "CartHistory_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedItem" ADD CONSTRAINT "SelectedItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedItem" ADD CONSTRAINT "SelectedItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem" ADD CONSTRAINT "OrderedItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem" ADD CONSTRAINT "OrderedItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BuyerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_groupOrderId_fkey" FOREIGN KEY ("groupOrderId") REFERENCES "GroupOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BuyerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryHistory" ADD CONSTRAINT "DeliveryHistory_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
