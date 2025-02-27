-- CreateTable
CREATE TABLE "run_features" (
    "runId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_features_pkey" PRIMARY KEY ("runId","featureId")
);

-- CreateTable
CREATE TABLE "run_scenarios" (
    "runId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_scenarios_pkey" PRIMARY KEY ("runId","scenarioId")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "runId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL,
    "duration" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("runId","stepId","scenarioId")
);

-- AddForeignKey
ALTER TABLE "run_features" ADD CONSTRAINT "run_features_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_features" ADD CONSTRAINT "run_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_scenarios" ADD CONSTRAINT "run_scenarios_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
