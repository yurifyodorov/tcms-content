/*
  Warnings:

  - You are about to drop the column `featureId` on the `scenarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `scenarios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_featureId_fkey";

-- DropIndex
DROP INDEX "scenarios_name_featureId_key";

-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "featureId";

-- CreateTable
CREATE TABLE "scenario_features" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "scenario_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scenario_features_scenarioId_featureId_key" ON "scenario_features"("scenarioId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "scenarios_name_key" ON "scenarios"("name");

-- AddForeignKey
ALTER TABLE "scenario_features" ADD CONSTRAINT "scenario_features_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_features" ADD CONSTRAINT "scenario_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
