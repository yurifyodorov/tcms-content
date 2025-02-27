/*
  Warnings:

  - The primary key for the `run_features` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `run_steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[runId,featureId]` on the table `run_features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[runId,stepId,scenarioId]` on the table `run_steps` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `run_features` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `run_steps` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "run_features" DROP CONSTRAINT "run_features_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "run_features_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "run_steps" DROP CONSTRAINT "run_steps_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "run_features_runId_featureId_key" ON "run_features"("runId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "run_steps_runId_stepId_scenarioId_key" ON "run_steps"("runId", "stepId", "scenarioId");
