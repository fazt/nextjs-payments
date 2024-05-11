-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionProvider" TEXT;

-- CreateTable
CREATE TABLE "UsersSubscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersSubscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsersSubscriptions" ADD CONSTRAINT "UsersSubscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
