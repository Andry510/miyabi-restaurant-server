-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "previous_refresh_token_hash" VARCHAR(255),
ADD COLUMN     "refresh_rotated_at" TIMESTAMP(3);
