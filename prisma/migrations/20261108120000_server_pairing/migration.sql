-- CreateEnum
CREATE TYPE "pairing_status" AS ENUM ('unpaired', 'paired', 'unlinked');

-- AlterTable
ALTER TABLE "server_settings" ADD COLUMN     "location_id" UUID,
ADD COLUMN     "paired_at" TIMESTAMP(3),
ADD COLUMN     "pairing_status" "pairing_status" NOT NULL DEFAULT 'unpaired',
ADD COLUMN     "server_token_enc" TEXT,
ADD COLUMN     "unlinked_at" TIMESTAMP(3),
ADD COLUMN     "unlinked_reason" VARCHAR(100);

