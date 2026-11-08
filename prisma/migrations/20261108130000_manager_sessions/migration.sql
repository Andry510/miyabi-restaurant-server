-- CreateTable
CREATE TABLE "manager_sessions" (
    "id" TEXT NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cloud_session_key" VARCHAR(255) NOT NULL,
    "access_token_enc" TEXT NOT NULL,
    "refresh_token_enc" TEXT NOT NULL,
    "access_expires_at" TIMESTAMP(3) NOT NULL,
    "last_access_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requester_ip" VARCHAR(50),
    "device" VARCHAR(150),
    "browser" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manager_sessions_token_hash_key" ON "manager_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "manager_sessions_cloud_session_key_idx" ON "manager_sessions"("cloud_session_key");

-- CreateIndex
CREATE INDEX "manager_sessions_last_access_at_idx" ON "manager_sessions"("last_access_at");

