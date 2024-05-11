/*
  Warnings:

  - You are about to drop the column `subscriptionPlanId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UsersSubscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionPlanId_fkey";

-- DropForeignKey
ALTER TABLE "UsersSubscriptions" DROP CONSTRAINT "UsersSubscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionPlanId",
ADD COLUMN     "status" TEXT,
ADD COLUMN     "userSubscriptionId" INTEGER;

-- DropTable
DROP TABLE "UsersSubscriptions";
