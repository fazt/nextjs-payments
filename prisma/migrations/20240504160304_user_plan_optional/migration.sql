-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionPlanId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "subscriptionPlanId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
