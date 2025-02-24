-- DropForeignKey
ALTER TABLE "scenario_steps" DROP CONSTRAINT "scenario_steps_scenarioId_fkey";

-- DropForeignKey
ALTER TABLE "scenario_steps" DROP CONSTRAINT "scenario_steps_stepId_fkey";

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
