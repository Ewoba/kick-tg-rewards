-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Prize" ADD COLUMN     "tokenSymbol" TEXT;

-- AlterTable
ALTER TABLE "PrizeClaim" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "txError" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WalletVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "message" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletVerification_nonce_idx" ON "WalletVerification"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "WalletVerification_userId_address_key" ON "WalletVerification"("userId", "address");

-- CreateIndex
CREATE INDEX "UserFollow_userId_idx" ON "UserFollow"("userId");

-- CreateIndex
CREATE INDEX "UserFollow_streamerId_idx" ON "UserFollow"("streamerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_userId_streamerId_key" ON "UserFollow"("userId", "streamerId");

-- CreateIndex
CREATE INDEX "PrizeClaim_status_idx" ON "PrizeClaim"("status");

-- CreateIndex
CREATE INDEX "PrizeClaim_userId_idx" ON "PrizeClaim"("userId");

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "Streamer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
