/*
  Warnings:

  - The `paymentId` column on the `Payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "paymentId",
ADD COLUMN     "paymentId" INTEGER;
