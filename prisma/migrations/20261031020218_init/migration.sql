-- CreateEnum
CREATE TYPE "units" AS ENUM ('box', 'piece', 'pack', 'bag', 'crate', 'sack', 'kg', 'liter');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "transfer_draft_status" AS ENUM ('open', 'sending', 'sent', 'partially_sent');

-- CreateEnum
CREATE TYPE "transfer_dispatch_status" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "shift_status" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "tip_period" AS ENUM ('day', 'week', 'shift');

-- CreateEnum
CREATE TYPE "tip_split_method" AS ENUM ('position_weight', 'manual');

-- CreateEnum
CREATE TYPE "week_day" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "tip_sanction_destination" AS ENUM ('fund', 'area', 'all');

-- CreateEnum
CREATE TYPE "tip_pool_status" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('present', 'absent', 'excused', 'incomplete');

-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('late_arrival', 'early_departure', 'late_departure', 'absence', 'missed_clock_in', 'missed_clock_out');

-- CreateTable
CREATE TABLE "server_settings" (
    "id" TEXT NOT NULL DEFAULT 'server',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "clock_in_window_minutes" SMALLINT NOT NULL DEFAULT 30,
    "tip_period" "tip_period" NOT NULL DEFAULT 'day',
    "late_arrival_shifts" DECIMAL(4,2) NOT NULL DEFAULT 0.5,
    "absence_shifts" DECIMAL(4,2) NOT NULL DEFAULT 2,
    "tip_sanction_destination" "tip_sanction_destination" NOT NULL DEFAULT 'fund',
    "week_start_day" "week_day" NOT NULL DEFAULT 'monday',
    "products_synced_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "user_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentications" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "password_need_reset" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "secret_key" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'active',
    "requester_ip" VARCHAR(50),
    "device" VARCHAR(150),
    "browser" VARCHAR(150),
    "revoked_by" TEXT,
    "revoked_at" TIMESTAMP(3),
    "expire_at" TIMESTAMP(3),
    "last_access_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_areas" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_positions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "cloud_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255),
    "picture" VARCHAR(255),
    "barcode" VARCHAR(100),
    "storage_code" VARCHAR(100) NOT NULL,
    "unit" "units" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "cloud_updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "late_tolerance_minutes" INTEGER NOT NULL DEFAULT 5,
    "early_leave_tolerance_minutes" SMALLINT NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_drafts" (
    "id" TEXT NOT NULL,
    "business_date" DATE NOT NULL,
    "status" "transfer_draft_status" NOT NULL DEFAULT 'open',
    "open_lock" BOOLEAN DEFAULT true,
    "sent_by" VARCHAR(255),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_job_positions" (
    "id" TEXT NOT NULL,
    "work_area_id" TEXT NOT NULL,
    "job_position_id" TEXT NOT NULL,
    "tip_weight" DECIMAL(4,2) NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "area_job_position_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_products" (
    "id" TEXT NOT NULL,
    "work_area_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_draft_requests" (
    "id" TEXT NOT NULL,
    "transfer_draft_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "requested_qty" INTEGER NOT NULL,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_draft_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_draft_items" (
    "id" TEXT NOT NULL,
    "transfer_draft_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "to_location_id" UUID,
    "transfer_draft_dispatch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_draft_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_draft_dispatches" (
    "id" TEXT NOT NULL,
    "transfer_draft_id" TEXT NOT NULL,
    "to_location_id" UUID NOT NULL,
    "status" "transfer_dispatch_status" NOT NULL DEFAULT 'pending',
    "idempotency_key" UUID NOT NULL,
    "transfer_id" UUID,
    "last_error" VARCHAR(255),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_draft_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shifts" (
    "id" TEXT NOT NULL,
    "user_assignment_id" TEXT NOT NULL,
    "work_schedule_id" TEXT NOT NULL,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "status" "shift_status" NOT NULL DEFAULT 'scheduled',
    "note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "employee_shift_id" TEXT NOT NULL,
    "status" "attendance_status" NOT NULL DEFAULT 'incomplete',
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "note" VARCHAR(500),
    "recorded_by_id" TEXT,
    "corrected_by" VARCHAR(255),
    "corrected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_incidents" (
    "id" TEXT NOT NULL,
    "attendance_record_id" TEXT NOT NULL,
    "type" "incident_type" NOT NULL,
    "minutes" INTEGER,
    "description" VARCHAR(500),
    "justification" VARCHAR(500),
    "justified_by" VARCHAR(255),
    "justified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_area_rules" (
    "id" TEXT NOT NULL,
    "work_area_id" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "method" "tip_split_method" NOT NULL DEFAULT 'position_weight',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tip_area_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_pools" (
    "id" TEXT NOT NULL,
    "period" "tip_period" NOT NULL,
    "start_day" DATE NOT NULL,
    "end_day" DATE NOT NULL,
    "work_schedule_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "tip_pool_status" NOT NULL DEFAULT 'open',
    "sanction_destination" "tip_sanction_destination" NOT NULL DEFAULT 'fund',
    "sanction_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "note" VARCHAR(500),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tip_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_pool_areas" (
    "id" TEXT NOT NULL,
    "tip_pool_id" TEXT NOT NULL,
    "work_area_id" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "method" "tip_split_method" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tip_pool_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_allocations" (
    "id" TEXT NOT NULL,
    "tip_pool_area_id" TEXT NOT NULL,
    "user_assignment_id" TEXT NOT NULL,
    "shifts" DECIMAL(6,2) NOT NULL,
    "sanction_shifts" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "weight" DECIMAL(4,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sanction_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "tip_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip_pool_shifts" (
    "id" TEXT NOT NULL,
    "tip_pool_id" TEXT NOT NULL,
    "employee_shift_id" TEXT NOT NULL,

    CONSTRAINT "tip_pool_shifts_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_first_name_last_name_idx" ON "profiles"("first_name", "last_name");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_email_key" ON "authentications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_phone_number_key" ON "authentications"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_user_id_key" ON "authentications"("user_id");

-- CreateIndex
CREATE INDEX "authentications_email_phone_number_idx" ON "authentications"("email", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_secret_key_key" ON "sessions"("secret_key");

-- CreateIndex
CREATE INDEX "sessions_status_expire_at_last_access_at_idx" ON "sessions"("status", "expire_at", "last_access_at");

-- CreateIndex
CREATE UNIQUE INDEX "work_areas_name_key" ON "work_areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_positions_name_key" ON "job_positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_cloud_id_key" ON "products"("cloud_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_storage_code_key" ON "products"("storage_code");

-- CreateIndex
CREATE INDEX "products_name_barcode_storage_code_idx" ON "products"("name", "barcode", "storage_code");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_drafts_open_lock_key" ON "transfer_drafts"("open_lock");

-- CreateIndex
CREATE INDEX "transfer_drafts_business_date_status_idx" ON "transfer_drafts"("business_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "area_job_positions_work_area_id_job_position_id_key" ON "area_job_positions"("work_area_id", "job_position_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_assignments_user_id_key" ON "user_assignments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_products_work_area_id_product_id_key" ON "area_products"("work_area_id", "product_id");

-- CreateIndex
CREATE INDEX "transfer_draft_requests_transfer_draft_id_created_by_id_idx" ON "transfer_draft_requests"("transfer_draft_id", "created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_draft_requests_transfer_draft_id_created_by_id_pro_key" ON "transfer_draft_requests"("transfer_draft_id", "created_by_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_draft_items_transfer_draft_id_product_id_key" ON "transfer_draft_items"("transfer_draft_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_draft_dispatches_idempotency_key_key" ON "transfer_draft_dispatches"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_draft_dispatches_transfer_id_key" ON "transfer_draft_dispatches"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_draft_dispatches_transfer_draft_id_to_location_id_key" ON "transfer_draft_dispatches"("transfer_draft_id", "to_location_id");

-- CreateIndex
CREATE INDEX "employee_shifts_user_assignment_id_scheduled_start_idx" ON "employee_shifts"("user_assignment_id", "scheduled_start");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employee_shift_id_key" ON "attendance_records"("employee_shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "tip_area_rules_work_area_id_key" ON "tip_area_rules"("work_area_id");

-- CreateIndex
CREATE INDEX "tip_pools_start_day_end_day_idx" ON "tip_pools"("start_day", "end_day");

-- CreateIndex
CREATE UNIQUE INDEX "tip_pool_areas_tip_pool_id_work_area_id_key" ON "tip_pool_areas"("tip_pool_id", "work_area_id");

-- CreateIndex
CREATE INDEX "tip_allocations_user_assignment_id_idx" ON "tip_allocations"("user_assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tip_allocations_tip_pool_area_id_user_assignment_id_key" ON "tip_allocations"("tip_pool_area_id", "user_assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tip_pool_shifts_employee_shift_id_key" ON "tip_pool_shifts"("employee_shift_id");

-- CreateIndex
CREATE INDEX "tip_pool_shifts_tip_pool_id_idx" ON "tip_pool_shifts"("tip_pool_id");

-- CreateIndex
CREATE UNIQUE INDEX "tip_sanction_types_name_key" ON "tip_sanction_types"("name");

-- CreateIndex
CREATE INDEX "tip_sanctions_tip_pool_id_idx" ON "tip_sanctions"("tip_pool_id");

-- CreateIndex
CREATE INDEX "tip_sanctions_user_assignment_id_idx" ON "tip_sanctions"("user_assignment_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_job_positions" ADD CONSTRAINT "area_job_positions_work_area_id_fkey" FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_job_positions" ADD CONSTRAINT "area_job_positions_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "job_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assignments" ADD CONSTRAINT "user_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assignments" ADD CONSTRAINT "user_assignments_area_job_position_id_fkey" FOREIGN KEY ("area_job_position_id") REFERENCES "area_job_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_products" ADD CONSTRAINT "area_products_work_area_id_fkey" FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_products" ADD CONSTRAINT "area_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_requests" ADD CONSTRAINT "transfer_draft_requests_transfer_draft_id_fkey" FOREIGN KEY ("transfer_draft_id") REFERENCES "transfer_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_requests" ADD CONSTRAINT "transfer_draft_requests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_requests" ADD CONSTRAINT "transfer_draft_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_items" ADD CONSTRAINT "transfer_draft_items_transfer_draft_id_fkey" FOREIGN KEY ("transfer_draft_id") REFERENCES "transfer_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_items" ADD CONSTRAINT "transfer_draft_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_items" ADD CONSTRAINT "transfer_draft_items_transfer_draft_dispatch_id_fkey" FOREIGN KEY ("transfer_draft_dispatch_id") REFERENCES "transfer_draft_dispatches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_draft_dispatches" ADD CONSTRAINT "transfer_draft_dispatches_transfer_draft_id_fkey" FOREIGN KEY ("transfer_draft_id") REFERENCES "transfer_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_user_assignment_id_fkey" FOREIGN KEY ("user_assignment_id") REFERENCES "user_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_shift_id_fkey" FOREIGN KEY ("employee_shift_id") REFERENCES "employee_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_incidents" ADD CONSTRAINT "attendance_incidents_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_area_rules" ADD CONSTRAINT "tip_area_rules_work_area_id_fkey" FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_pools" ADD CONSTRAINT "tip_pools_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_pool_areas" ADD CONSTRAINT "tip_pool_areas_tip_pool_id_fkey" FOREIGN KEY ("tip_pool_id") REFERENCES "tip_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_pool_areas" ADD CONSTRAINT "tip_pool_areas_work_area_id_fkey" FOREIGN KEY ("work_area_id") REFERENCES "work_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_allocations" ADD CONSTRAINT "tip_allocations_tip_pool_area_id_fkey" FOREIGN KEY ("tip_pool_area_id") REFERENCES "tip_pool_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_allocations" ADD CONSTRAINT "tip_allocations_user_assignment_id_fkey" FOREIGN KEY ("user_assignment_id") REFERENCES "user_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_pool_shifts" ADD CONSTRAINT "tip_pool_shifts_tip_pool_id_fkey" FOREIGN KEY ("tip_pool_id") REFERENCES "tip_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_pool_shifts" ADD CONSTRAINT "tip_pool_shifts_employee_shift_id_fkey" FOREIGN KEY ("employee_shift_id") REFERENCES "employee_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_tip_pool_id_fkey" FOREIGN KEY ("tip_pool_id") REFERENCES "tip_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_user_assignment_id_fkey" FOREIGN KEY ("user_assignment_id") REFERENCES "user_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip_sanctions" ADD CONSTRAINT "tip_sanctions_tip_sanction_type_id_fkey" FOREIGN KEY ("tip_sanction_type_id") REFERENCES "tip_sanction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
