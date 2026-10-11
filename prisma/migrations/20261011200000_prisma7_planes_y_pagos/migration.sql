-- Actualización a Prisma 7 y cierre de los flujos de pago.
--  * Payments.paymentId pasa a TEXT (los ids de Mercado Pago ya no caben en INTEGER
--    y ahora también guarda ids de Stripe y PayPal) y se vuelve único por pasarela
--    para que los webhooks reintentados no dupliquen pagos.
--  * SubscriptionPlan guarda features e ids de precio/plan de Stripe y PayPal.
--  * User referencia su plan (planId) y se elimina userSubscriptionId (sin uso).
--  * ProductCategory se borra en cascada con su producto o categoría.
--  * La tabla implícita _OrderToProduct usa clave primaria (formato de Prisma 6+).

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "paymentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paypalPlanId" TEXT,
ADD COLUMN     "stripePriceId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userSubscriptionId",
ADD COLUMN     "planId" INTEGER;

-- AlterTable
ALTER TABLE "_OrderToProduct" ADD CONSTRAINT "_OrderToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OrderToProduct_AB_unique";

-- CreateIndex
CREATE UNIQUE INDEX "Payments_provider_paymentId_key" ON "Payments"("provider", "paymentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

