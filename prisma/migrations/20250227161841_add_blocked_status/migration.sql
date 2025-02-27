/*
  Warnings:

  - The primary key for the `run_features` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `run_features` table. All the data in the column will be lost.
  - The primary key for the `run_scenarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `featureId` on the `run_scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `run_scenarios` table. All the data in the column will be lost.
  - The primary key for the `run_steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `run_steps` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_featureId_fkey";

-- DropForeignKey
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_runId_fkey";

-- DropForeignKey
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_scenarioId_fkey";

-- DropIndex
DROP INDEX "run_features_runId_featureId_key";

-- DropIndex
DROP INDEX "run_steps_runId_stepId_scenarioId_key";

-- AlterTable
ALTER TABLE "run_features" DROP CONSTRAINT "run_features_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "run_features_pkey" PRIMARY KEY ("runId", "featureId");

-- AlterTable
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_pkey",
DROP COLUMN "featureId",
DROP COLUMN "id",
ADD CONSTRAINT "run_scenarios_pkey" PRIMARY KEY ("runId", "scenarioId");

-- AlterTable
ALTER TABLE "run_steps" DROP CONSTRAINT "run_steps_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "run_steps_pkey" PRIMARY KEY ("runId", "stepId", "scenarioId");

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
