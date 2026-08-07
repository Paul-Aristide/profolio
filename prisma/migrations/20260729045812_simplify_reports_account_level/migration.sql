/*
  Warnings:

  - You are about to drop the column `postId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedUserId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reporterId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Report` table. All the data in the column will be lost.
  - Added the required column `reason` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_postId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reportedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "postId",
DROP COLUMN "reportedUserId",
DROP COLUMN "reporterId",
DROP COLUMN "type",
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
