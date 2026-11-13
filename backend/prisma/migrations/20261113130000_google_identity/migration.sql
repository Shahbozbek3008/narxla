ALTER TABLE "users" DROP CONSTRAINT "users_identity";

ALTER TABLE "users" ADD CONSTRAINT "users_identity" CHECK ("phone" IS NOT NULL OR "telegramId" IS NOT NULL OR "googleId" IS NOT NULL);
