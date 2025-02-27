/*
  Warnings:

  - You are about to drop the `run_scenarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_runId_fkey";

-- DropForeignKey
ALTER TABLE "run_scenarios" DROP CONSTRAINT "run_scenarios_scenarioId_fkey";

-- DropTable
DROP TABLE "run_scenarios";

-- CreateTable
CREATE TABLE "RunScenario" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "RunScenario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RunScenario" ADD CONSTRAINT "RunScenario_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunScenario" ADD CONSTRAINT "RunScenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunScenario" ADD CONSTRAINT "RunScenario_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
