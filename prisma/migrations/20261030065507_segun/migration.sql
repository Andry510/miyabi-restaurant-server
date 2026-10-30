/*
  Warnings:

  - The values [equal,minutes] on the enum `tip_split_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `minutes` on the `tip_allocations` table. All the data in the column will be lost.
  - Added the required column `shifts` to the `tip_allocations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "week_day" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "tip_sanction_destination" AS ENUM ('fund', 'area', 'all');

-- AlterEnum
BEGIN;
CREATE TYPE "tip_split_method_new" AS ENUM ('position_weight', 'manual');
ALTER TABLE "restaurant"."tip_area_rules" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "tip_area_rules" ALTER COLUMN "method" TYPE "tip_split_method_new" USING ("method"::text::"tip_split_method_new");
ALTER TABLE "tip_pool_areas" ALTER COLUMN "method" TYPE "tip_split_method_new" USING ("method"::text::"tip_split_method_new");
ALTER TYPE "tip_split_method" RENAME TO "tip_split_method_old";
ALTER TYPE "tip_split_method_new" RENAME TO "tip_split_method";
DROP TYPE "restaurant"."tip_split_method_old";
ALTER TABLE "tip_area_rules" ALTER COLUMN "method" SET DEFAULT 'position_weight';
COMMIT;

-- AlterTable
ALTER TABLE "attendance_incidents" ADD COLUMN     "justification" VARCHAR(500),
ADD COLUMN     "justified_at" TIMESTAMP(3),
ADD COLUMN     "justified_by" VARCHAR(255);

-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN     "corrected_at" TIMESTAMP(3),
ADD COLUMN     "corrected_by" VARCHAR(255);

-- AlterTable
ALTER TABLE "server_settings" ADD COLUMN     "absence_shifts" DECIMAL(4,2) NOT NULL DEFAULT 2,
ADD COLUMN     "late_arrival_shifts" DECIMAL(4,2) NOT NULL DEFAULT 0.5,
ADD COLUMN     "tip_sanction_destination" "tip_sanction_destination" NOT NULL DEFAULT 'fund',
ADD COLUMN     "week_start_day" "week_day" NOT NULL DEFAULT 'monday';

-- AlterTable
ALTER TABLE "tip_allocations" DROP COLUMN "minutes",
ADD COLUMN     "sanction_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sanction_shifts" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shifts" DECIMAL(6,2) NOT NULL;

-- AlterTable
ALTER TABLE "tip_area_rules" ALTER COLUMN "method" SET DEFAULT 'position_weight';

-- AlterTable
ALTER TABLE "tip_pool_areas" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "tip_pools" ADD COLUMN     "sanction_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sanction_destination" "tip_sanction_destination" NOT NULL DEFAULT 'fund';

-- AlterTable
ALTER TABLE "work_schedules" ADD COLUMN     "early_leave_tolerance_minutes" SMALLINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "tip_sanction_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shifts" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "removes_all" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tip_sanction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_sanctions" (
    "id" TEXT NOT NULL,
    "tip_pool_id" TEXT NOT NULL,
    "user_assignment_id" TEXT NOT NULL,
    "tip_sanction_type_id" TEXT NOT NULL,
    "shifts" DECIMAL(4,2) NOT NULL,
    "removes_all" BOOLEAN NOT NULL,
    "note" VARCHAR(500),
    "created_by" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tip_sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tip_sanction_types_name_key" ON "tip_sanction_types"("name");

-- CreateIndex
CREATE INDEX "tip_sanctions_tip_pool_id_idx" ON "tip_sanctions"("tip_pool_id");

-- CreateIndex
CREATE INDEX "tip_sanctions_user_assignment_id_idx" ON "tip_sanctions"("user_assignment_id");

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_tip_pool_id_fkey" FOREIGN KEY ("tip_pool_id") REFERENCES "tip_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_user_assignment_id_fkey" FOREIGN KEY ("user_assignment_id") REFERENCES "user_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_tip_sanction_type_id_fkey" FOREIGN KEY ("tip_sanction_type_id") REFERENCES "tip_sanction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
