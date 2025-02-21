-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('passed', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "runNumber" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "featuresCount" INTEGER NOT NULL,
    "scenariosCount" INTEGER NOT NULL,
    "stepsCount" INTEGER NOT NULL,
    "passCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "auto" BOOLEAN NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uri" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line" INTEGER,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "tags" TEXT[],
    "duration" INTEGER,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "duration" INTEGER,
    "message" TEXT,
    "media" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "runs_runNumber_key" ON "runs"("runNumber");

-- CreateIndex
CREATE INDEX "runs_status_idx" ON "runs"("status");

-- CreateIndex
CREATE INDEX "runs_platform_idx" ON "runs"("platform");

-- CreateIndex
CREATE INDEX "runs_auto_idx" ON "runs"("auto");

-- CreateIndex
CREATE INDEX "runs_createdAt_idx" ON "runs"("createdAt");

-- CreateIndex
CREATE INDEX "runs_status_createdAt_idx" ON "runs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "features_runId_idx" ON "features"("runId");

-- CreateIndex
CREATE INDEX "scenarios_featureId_idx" ON "scenarios"("featureId");

-- CreateIndex
CREATE INDEX "scenarios_runId_idx" ON "scenarios"("runId");

-- CreateIndex
CREATE INDEX "steps_scenarioId_idx" ON "steps"("scenarioId");

-- CreateIndex
CREATE INDEX "steps_status_idx" ON "steps"("status");

-- CreateIndex
CREATE INDEX "steps_runId_idx" ON "steps"("runId");

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
