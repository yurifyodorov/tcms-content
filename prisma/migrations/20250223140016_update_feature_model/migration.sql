/*
  Warnings:

  - You are about to drop the column `description` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `runId` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `failCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `featuresCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `passCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `scenariosCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `skipCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `stepsCount` on the `runs` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `runId` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `runId` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `scenarioId` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `steps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,featureId]` on the table `scenarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `steps` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "features" DROP CONSTRAINT "features_runId_fkey";

-- DropForeignKey
ALTER TABLE "steps" DROP CONSTRAINT "steps_scenarioId_fkey";

-- DropIndex
DROP INDEX "features_runId_idx";

-- DropIndex
DROP INDEX "runs_auto_idx";

-- DropIndex
DROP INDEX "runs_status_createdAt_idx";

-- DropIndex
DROP INDEX "scenarios_featureId_idx";

-- DropIndex
DROP INDEX "scenarios_runId_idx";

-- DropIndex
DROP INDEX "steps_runId_idx";

-- DropIndex
DROP INDEX "steps_scenarioId_idx";

-- DropIndex
DROP INDEX "steps_status_idx";

-- AlterTable
ALTER TABLE "features" DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "runId",
DROP COLUMN "uri";

-- AlterTable
ALTER TABLE "runs" DROP COLUMN "failCount",
DROP COLUMN "featuresCount",
DROP COLUMN "passCount",
DROP COLUMN "scenariosCount",
DROP COLUMN "skipCount",
DROP COLUMN "stepsCount";

-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "duration",
DROP COLUMN "line",
DROP COLUMN "message",
DROP COLUMN "runId",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "steps" DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "media",
DROP COLUMN "message",
DROP COLUMN "runId",
DROP COLUMN "scenarioId",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "run_features" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "run_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_scenarios" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,

    CONSTRAINT "run_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,

    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_steps" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,

    CONSTRAINT "scenario_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_features_runId_featureId_key" ON "run_features"("runId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "run_scenarios_runId_scenarioId_key" ON "run_scenarios"("runId", "scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "run_steps_runId_stepId_key" ON "run_steps"("runId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_steps_scenarioId_stepId_key" ON "scenario_steps"("scenarioId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "features_name_key" ON "features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "scenarios_name_featureId_key" ON "scenarios"("name", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "steps_name_key" ON "steps"("name");

-- AddForeignKey
ALTER TABLE "run_features" ADD CONSTRAINT "run_features_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_features" ADD CONSTRAINT "run_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
