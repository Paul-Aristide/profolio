/*
  Warnings:

  - The primary key for the `TrustedDevice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `TrustedDevice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TrustedDevice" DROP CONSTRAINT "TrustedDevice_pkey",
ADD CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_id_key" ON "TrustedDevice"("id");
