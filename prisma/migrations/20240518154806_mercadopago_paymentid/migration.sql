/*
  Warnings:

  - Added the required column `paymentId` to the `Payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL;
