-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_orderId_fkey";

-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
