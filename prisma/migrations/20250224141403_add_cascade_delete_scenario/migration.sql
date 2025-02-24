-- DropForeignKey
ALTER TABLE "features_tags" DROP CONSTRAINT "features_tags_featureId_fkey";

-- DropForeignKey
ALTER TABLE "scenarios_tags" DROP CONSTRAINT "scenarios_tags_scenarioId_fkey";

-- AddForeignKey
ALTER TABLE "features_tags" ADD CONSTRAINT "features_tags_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios_tags" ADD CONSTRAINT "scenarios_tags_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
