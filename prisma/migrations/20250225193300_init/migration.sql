-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('passed', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "runNumber" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
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
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "media" JSONB,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_steps" (
    "scenarioId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,

    CONSTRAINT "scenario_steps_pkey" PRIMARY KEY ("scenarioId","stepId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features_tags" (
    "featureId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "features_tags_pkey" PRIMARY KEY ("featureId","tagId")
);

-- CreateTable
CREATE TABLE "scenarios_tags" (
    "scenarioId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "scenarios_tags_pkey" PRIMARY KEY ("scenarioId","tagId")
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
CREATE INDEX "scenarios_featureId_idx" ON "scenarios"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features_tags" ADD CONSTRAINT "features_tags_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features_tags" ADD CONSTRAINT "features_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios_tags" ADD CONSTRAINT "scenarios_tags_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios_tags" ADD CONSTRAINT "scenarios_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
