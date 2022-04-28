/*
  Warnings:

  - A unique constraint covering the columns `[nodeId]` on the table `Subscriber` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_nodeId_key" ON "Subscriber"("nodeId");
