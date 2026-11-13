ALTER TABLE "users" ADD COLUMN "googleId" TEXT,
ADD COLUMN "email" TEXT;

CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
