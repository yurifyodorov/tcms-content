import { createId } from '../shared/lib/id';
import { dbClient } from '../shared/lib/db';

import {
    TestData,
    ParsedFeature,
    ParsedScenario,
    ParsedStep,
    FeatureTag,
    ScenarioTag,
    ScenarioStep
} from "./types";

import { synchronizeFeatures } from "./synchronize-features";
import { collectFeatures } from "./collect-features";

import { synchronizeScenarios } from "./synchronize-scenarios";
import { collectScenarios } from './collect-scenarios';

import { synchronizeSteps } from "./synchronize-steps";
import { collectSteps } from './collect-steps';

import { synchronizeTags } from "./synchronize-tags";
import { collectTags } from "./collect-tags";

export async function saveResults(
    runId: string,
    browser: string,
    platform: string,
    environment: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> {

    console.log(`runId: ${runId}`);
    console.log(`browser: ${browser}`);
    console.log(`platform: ${platform}`);
    console.log(`environment: ${environment}`);
    console.log(`databaseUrl: ${databaseUrl}`);

    await synchronizeTags(testData);
    await synchronizeFeatures(testData);

    const tags = collectTags(testData);

    const scenarios = collectScenarios(testData);
    console.log("Scenarios to be saved:", JSON.stringify(scenarios, null, 2));

    const scenarioMap = new Map<string, string>();
    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            scenarioMap.set(scenario.id, scenarios[featureIndex * feature.elements.length + scenarioIndex].id);
        });
    });

    const features = collectFeatures(testData);
    console.log("Features to be saved:", JSON.stringify(features, null, 2));

    const steps = collectSteps(testData);
    console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    let featuresCount = 0;
    let scenariosCount = 0;
    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let stepsCount = 0;

    let featuresToCreate: ParsedFeature[] = [];
    let scenariosToCreate: ParsedScenario[] = [];
    let stepsToCreate: ParsedStep[] = [];

    let status = 'completed';

    let runDuration = 0;

    const featureTagsToCreate: FeatureTag[] = [];
    const scenarioTagsToCreate: ScenarioTag[] = [];
    const scenarioStepsToCreate: ScenarioStep[] = [];

    const tagsSet = new Set<string>();
    tags.forEach(tag => {
        tagsSet.add(tag.name.trim());
    });

    const tagsInDb = await dbClient.tag.findMany();
    const tagMap = new Map<string, string>();
    tagsInDb.forEach(tag => {
        tagMap.set(tag.name.trim(), tag.id);
    });

    for (const feature of testData) {
        featuresCount++;

        const tags = (feature.tags || []).map((tag: { name: string }) => tag.name.trim());

        const existingFeature = await dbClient.feature.findFirst({
            where: { name: feature.name.trim() }
        });

        let featureId: string;

        if (existingFeature) {
            featureId = existingFeature.id;
            await dbClient.feature.update({
                where: { id: featureId },
                data: {
                    keyword: feature.keyword,
                    description: feature.description || '',
                },
            });
        } else {
            featureId = createId();
            await dbClient.feature.create({
                data: {
                    id: featureId,
                    keyword: feature.keyword,
                    name: feature.name,
                    description: feature.description || '',
                },
            });
        }

        for (const tagName of tags) {
            let tagId = tagMap.get(tagName);
            if (!tagId) {
                const newTag = await dbClient.tag.create({
                    data: { name: tagName },
                });
                tagId = newTag.id;
                tagMap.set(tagName, tagId);
            }

            featureTagsToCreate.push({
                featureId: featureId,
                tagId: tagId,
            });
        }

        for (const scenario of feature.elements) {
            const scenarioId = createId();

            const scenarioTags = (scenario.tags || []).map((tag: { name: string }) => tag.name.trim());

            for (const tagName of scenarioTags) {
                let tagId = tagMap.get(tagName);
                if (!tagId) {
                    const newTag = await dbClient.tag.create({
                        data: { name: tagName },
                    });
                    tagId = newTag.id;
                    tagMap.set(tagName, tagId);
                }

                scenarioTagsToCreate.push({
                    scenarioId: scenarioId,
                    tagId: tagId,
                });
            }

            const scenarioData: ParsedScenario = {
                id: scenarioId,
                featureId: featureId,
                keyword: feature.keyword,
                name: scenario.name,
            };

            scenariosToCreate.push(scenarioData);

            for (const step of scenario.steps) {
                const stepData: ParsedStep = {
                    id: createId(),
                    scenarioId: scenarioId,
                    keyword: step.keyword,
                    name: step.name,
                    media: step.media
                };

                stepsToCreate.push(stepData);
                stepsCount++;

                scenarioStepsToCreate.push({
                    scenarioId: scenarioId,
                    stepId: stepData.id,
                });
            }

            scenariosCount++;
        }
    }

    if (failCount > 0) {
        status = 'failed';
    }

    const tagsToCreate = Array.from(tagsSet).map(tagName => ({
        name: tagName,
    }));

    await dbClient.tag.createMany({
        data: tagsToCreate,
        skipDuplicates: true,
    });

    await dbClient.run.create({
        data: {
            id: runId,
            status: status,
            browser: browser,
            platform: platform,
            featuresCount,
            scenariosCount,
            passCount,
            failCount,
            skipCount,
            stepsCount,
            auto: true,
            duration: runDuration,
        }
    });

    await dbClient.$transaction([
        dbClient.feature.createMany({ data: featuresToCreate, skipDuplicates: true }),
        dbClient.scenario.createMany({ data: scenariosToCreate }),
        dbClient.step.createMany({ data: stepsToCreate }),
        dbClient.scenarioStep.createMany({ data: scenarioStepsToCreate }),
        dbClient.featureTag.createMany({ data: featureTagsToCreate }),
        dbClient.scenarioTag.createMany({ data: scenarioTagsToCreate }),
        dbClient.run.update({
            where: { id: runId },
            data: {
                featuresCount,
                scenariosCount,
                passCount,
                failCount,
                skipCount,
                stepsCount,
                duration: runDuration,
            }
        }),
    ]);
}
