-- CreateTable
CREATE TABLE "labour_rates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "maxPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labour_rates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "labour_rates_price_range" CHECK ("minPrice" > 0 AND "minPrice" <= "price" AND "price" <= "maxPrice")
);

-- CreateIndex
CREATE UNIQUE INDEX "labour_rates_code_key" ON "labour_rates"("code");

