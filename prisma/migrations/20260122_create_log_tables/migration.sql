-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('auth', 'activity', 'business', 'system');

-- CreateTable
CREATE TABLE "event_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "user_role" VARCHAR(20),
    "category" "LogCategory" NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255),
    "resource_type" VARCHAR(50),
    "resource_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_request_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "method" VARCHAR(10) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "query_params" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "source" VARCHAR(200) NOT NULL,
    "error_type" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_logs_user_id_idx" ON "event_logs"("user_id");

-- CreateIndex
CREATE INDEX "event_logs_category_idx" ON "event_logs"("category");

-- CreateIndex
CREATE INDEX "event_logs_action_idx" ON "event_logs"("action");

-- CreateIndex
CREATE INDEX "event_logs_resource_type_resource_id_idx" ON "event_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "event_logs_created_at_idx" ON "event_logs"("created_at");

-- CreateIndex
CREATE INDEX "event_logs_user_role_category_idx" ON "event_logs"("user_role", "category");

-- CreateIndex
CREATE INDEX "api_request_logs_user_id_idx" ON "api_request_logs"("user_id");

-- CreateIndex
CREATE INDEX "api_request_logs_path_idx" ON "api_request_logs"("path");

-- CreateIndex
CREATE INDEX "api_request_logs_status_idx" ON "api_request_logs"("status");

-- CreateIndex
CREATE INDEX "api_request_logs_created_at_idx" ON "api_request_logs"("created_at");

-- CreateIndex
CREATE INDEX "error_logs_source_idx" ON "error_logs"("source");

-- CreateIndex
CREATE INDEX "error_logs_error_type_idx" ON "error_logs"("error_type");

-- CreateIndex
CREATE INDEX "error_logs_resolved_idx" ON "error_logs"("resolved");

-- CreateIndex
CREATE INDEX "error_logs_created_at_idx" ON "error_logs"("created_at");
