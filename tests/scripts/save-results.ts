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
    await synchronizeScenarios(testData);

    const tags = collectTags(testData);

    const features = await collectFeatures(testData);
    const scenarios = await collectScenarios(testData);

    console.log('FEATURES:', JSON.stringify(features, null, 2));

    const scenarioMap = new Map<string, string>();
    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            scenarioMap.set(scenario.id, scenarios[featureIndex * feature.elements.length + scenarioIndex].id);
        });
    });

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
            const shouldUpdateFeature = existingFeature.keyword !== feature.keyword || existingFeature.description !== feature.description;

            if (shouldUpdateFeature) {
                console.log(`Feature "${feature.name}" exists and has changes. Updating...`);
                await dbClient.feature.update({
                    where: { id: featureId },
                    data: {
                        keyword: feature.keyword,
                        description: feature.description || '',
                    },
                });
            } else {
                console.log(`Feature "${feature.name}" exists and no changes. Skipping update.`);
            }
        } else {
            featureId = createId();
            console.log(`Feature "${feature.name}" is new. Creating...`);
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
                    scenarioIds: [scenarioId],
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

    // Ensuring tags are added only once
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
            environment: environment,
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

    console.log("featuresToCreate:", JSON.stringify(featuresToCreate, null, 2));
    // console.log("scenariosToCreate:", JSON.stringify(scenariosToCreate, null, 2));
    // console.log("stepsToCreate:", JSON.stringify(stepsToCreate, null, 2));
    // console.log("scenarioStepsToCreate:", JSON.stringify(scenarioStepsToCreate, null, 2));
    // console.log("featureTagsToCreate:", JSON.stringify(featureTagsToCreate, null, 2));
    // console.log("scenarioTagsToCreate:", JSON.stringify(scenarioTagsToCreate, null, 2));

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


    console.log("Data successfully saved!");
}