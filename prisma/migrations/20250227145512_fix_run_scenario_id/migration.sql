/*
  Warnings:

  - You are about to drop the `RunScenario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RunScenario" DROP CONSTRAINT "RunScenario_featureId_fkey";

-- DropForeignKey
ALTER TABLE "RunScenario" DROP CONSTRAINT "RunScenario_runId_fkey";

-- DropForeignKey
ALTER TABLE "RunScenario" DROP CONSTRAINT "RunScenario_scenarioId_fkey";

-- DropTable
DROP TABLE "RunScenario";

-- CreateTable
CREATE TABLE "run_scenarios" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "run_scenarios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
