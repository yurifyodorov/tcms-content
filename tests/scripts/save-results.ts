import { createId } from '../shared/lib/id';
import { dbClient } from '../shared/lib/db';
import { synchronizeTags } from "./synchronize-tags";
import { synchronizeFeatures } from "./synchronize-features";
import { synchronizeScenarios } from "./synchronize-scenarios";
import { collectFeatures } from "./collect-features";
import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';
import { collectTags } from "./collect-tags";
import { TestData, ParsedFeature, ParsedScenario, ParsedStep, FeatureTag, ScenarioTag, ScenarioStep } from "./types";

export async function saveResults(
    runId: string,
    browser: string,
    platform: string,
    environment: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> {
    console.log({ runId, browser, platform, environment, databaseUrl });

    await Promise.all([synchronizeTags(testData), synchronizeFeatures(testData), synchronizeScenarios(testData)]);

    const [, features, scenarios] = await Promise.all([
        collectTags(testData),
        collectFeatures(testData),
        collectScenarios(testData)
    ]);
    const steps = collectSteps(testData, scenarios);

    const tagMap = new Map<string, string>();
    (await dbClient.tag.findMany()).forEach(tag => tagMap.set(tag.name.trim(), tag.id));

    const featureTags: FeatureTag[] = [];
    const scenarioTags: ScenarioTag[] = [];
    const scenarioSteps: ScenarioStep[] = [];
    const featuresToCreate: ParsedFeature[] = [];
    const scenariosToCreate: ParsedScenario[] = [];
    const stepsToCreate: ParsedStep[] = [];

    for (const feature of features) {
        let featureId = (await dbClient.feature.findFirst({ where: { name: feature.name.trim() } }))?.id;
        if (!featureId) {
            featureId = createId();
            featuresToCreate.push({ ...feature, id: featureId });
        }

        for (const tag of (Array.isArray(feature.tags) ? feature.tags : [])) {
            const tagName = tag.name.trim();
            let tagId = tagMap.get(tagName) || (await dbClient.tag.create({ data: { name: tagName } })).id;
            tagMap.set(tagName, tagId);
            featureTags.push({ featureId, tagId });
        }

        for (const scenario of feature.scenarios ?? []) {
            const scenarioId = createId();
            scenariosToCreate.push({ ...scenario, id: scenarioId, featureId });

            for (const tag of (Array.isArray(scenario.tags) ? scenario.tags : [])) {
                const tagName = tag.name.trim();
                let tagId = tagMap.get(tagName) || (await dbClient.tag.create({ data: { name: tagName } })).id;
                tagMap.set(tagName, tagId);
                scenarioTags.push({ scenarioId, tagId });
            }

            steps.filter(step => step.scenarioIds.includes(scenarioId)).forEach(step => {
                stepsToCreate.push({ ...step, scenarioIds: [scenarioId] });
                scenarioSteps.push({ scenarioId, stepId: step.id });
            });
        }
    }

    await dbClient.$transaction([
        dbClient.tag.createMany({ data: [...tagMap.keys()].map(name => ({ name })), skipDuplicates: true }),
        dbClient.feature.createMany({ data: featuresToCreate, skipDuplicates: true }),
        dbClient.scenario.createMany({ data: scenariosToCreate }),
        dbClient.step.createMany({ data: stepsToCreate }),
        dbClient.scenarioStep.createMany({ data: scenarioSteps }),
        dbClient.featureTag.createMany({ data: featureTags }),
        dbClient.scenarioTag.createMany({ data: scenarioTags }),
        dbClient.run.create({
            data: {
                id: runId,
                status: 'completed',
                browser,
                platform,
                environment,
                featuresCount: features.length,
                scenariosCount: scenarios.length,
                passCount: 0,
                failCount: 0,
                skipCount: 0,
                stepsCount: steps.length,
                auto: true,
                duration: 0,
            }
        })
    ]);

    console.log("Data successfully saved!");
}