/*
  Warnings:

  - You are about to drop the column `scenarioId` on the `steps` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "steps_scenarioId_idx";

-- AlterTable
ALTER TABLE "steps" DROP COLUMN "scenarioId";
