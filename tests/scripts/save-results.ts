import { createId } from '../shared/lib/id';
import { dbClient } from '../shared/lib/db';

import {
    TestData,
    ParsedFeature,
    ParsedScenario,
    ParsedStep,
} from "./types";

import {
    FeatureTag,
    ScenarioTag,
    ScenarioStep,
    RunFeature,
    RunScenario,
    RunStep,
    Status
} from "@prisma/client";

import { synchronizeFeatures } from "./synchronize-features";
import { collectFeatures } from "./collect-features";

import { synchronizeScenarios } from "./synchronize-scenarios";
import { collectScenarios } from './collect-scenarios';

import { synchronizeSteps } from "./synchronize-steps";
import { collectSteps } from './collect-steps';

import { synchronizeTags } from "./synchronize-tags";
import { collectTags } from "./collect-tags";

export const scenarioMap = new Map<string, string>();

export async function saveResults(
    runId: string,
    browser: string,
    platform: string,
    environment: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> {
    console.log(`Run details - ID: ${runId}, Browser: ${browser}, Platform: ${platform}, Env: ${environment}, DB: ${databaseUrl}`);

    await synchronizeTags(testData);
    await synchronizeFeatures(testData);

    const tags = collectTags(testData);
    const features = await collectFeatures(testData);
    const scenarios = await collectScenarios(testData);

    // console.log('TAGS:', JSON.stringify(tags, null, 2));
    // console.log('FEATURES:', JSON.stringify(features, null, 2));
    // console.log('SCENARIOS:', JSON.stringify(scenarios, null, 2));

    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            const scenarioId = scenarios[featureIndex * feature.elements.length + scenarioIndex].id;
            scenarioMap.set(scenario.id, scenarioId);
        });
    });

    const steps = collectSteps(testData);
    await synchronizeSteps(Array.from(steps.values()));

    // console.log('STEPS:', JSON.stringify(steps, null, 2));


    let featuresCount = 0, scenariosCount = 0, passCount = 0, failCount = 0, skipCount = 0, stepsCount = 0;
    let status = 'completed', runDuration = 0;

    const featuresToCreate: ParsedFeature[] = [];
    const scenariosToCreate: ParsedScenario[] = [];
    const stepsToCreate: ParsedStep[] = [];

    const featureTagsToCreate: FeatureTag[] = [];
    const scenarioTagsToCreate: ScenarioTag[] = [];
    const scenarioStepsToCreate: ScenarioStep[] = [];

    const runFeaturesToCreate: RunFeature[] = [];
    const runScenariosToCreate: RunScenario[] = [];
    const runStepsToCreate: RunStep[] = [];

    const tagsSet = new Set<string>(tags.map(tag => tag.name.trim()));

    const tagsInDb = await dbClient.tag.findMany();
    const tagMap = new Map(tagsInDb.map(tag => [tag.name.trim(), tag.id]));

    for (const feature of features) {
        featuresCount++;

        const featureTags = feature.tags?.connect.map(tag => tag.id) || [];
        const featureDescription = feature.description || '';

        let featureId = feature.id;

        const existingFeature = await dbClient.feature.findFirst({ where: { name: feature.name.trim() } });

        if (existingFeature) {
            featureId = existingFeature.id;
            if (existingFeature.keyword !== feature.keyword || existingFeature.description !== featureDescription) {
                await dbClient.feature.update({
                    where: { id: featureId },
                    data: { keyword: feature.keyword, description: featureDescription }
                });
            }
        } else {
            await dbClient.feature.create({
                data: { id: featureId, keyword: feature.keyword, name: feature.name, description: featureDescription }
            });
        }

        featuresToCreate.push({ id: featureId, keyword: feature.keyword, name: feature.name, description: featureDescription });

        for (const tagId of featureTags) {
            featureTagsToCreate.push({ featureId, tagId });
        }

        const originalFeature = testData.find(f => f.name.trim() === feature.name.trim());
        if (!originalFeature) continue;

        for (const scenario of originalFeature.elements) {
            const scenarioId = createId();
            const scenarioDescription = scenario.description?.trim() || '';

            scenariosToCreate.push({
                id: scenarioId,
                featureId: featureId,
                keyword: scenario.keyword,
                name: scenario.name,
                description: scenarioDescription
            });

            for (const tag of scenario.tags || []) {
                let tagId = tagMap.get(tag.name.trim());
                if (!tagId) {
                    tagId = (await dbClient.tag.create({ data: { name: tag.name.trim() } })).id;
                    tagMap.set(tag.name.trim(), tagId);
                }
                scenarioTagsToCreate.push({ scenarioId, tagId });
            }

            scenario.steps.forEach(step => {
                const stepName = step.name.trim();
                const stepData = steps.get(stepName);

                if (!stepData) {
                    console.error(`Step "${stepName}" not found in stepsMap`);
                    return;
                }

                scenarioStepsToCreate.push({ scenarioId, stepId: stepData.id });

                if (!stepsToCreate.find(s => s.id === stepData.id)) {
                    stepsToCreate.push({
                        id: stepData.id,
                        scenarioIds: stepData.scenarioIds,
                        keyword: stepData.keyword,
                        name: stepData.name,
                        media: stepData.media
                    });
                }
            });

            scenariosCount++;
        }
    }

    await synchronizeScenarios(scenariosToCreate.map(scenario => ({
        ...scenario,
        steps: [],
        tags: [],
        type: 'Scenario' as const
    })));


    if (failCount > 0) {
        status = 'failed';
    }

    const tagsToCreate = Array.from(tagsSet).map(tagName => ({
        name: tagName,
    }));

    const runFeaturesToCreateMapped = runFeaturesToCreate.map((item) => ({
        ...item,
        status: item.status as Status,
    }));

    const runScenariosToCreateMapped = runScenariosToCreate.map((item) => ({
        ...item,
        status: item.status as Status,
    }));

    const runStepsToCreateMapped = runStepsToCreate.map((item) => ({
        ...item,
        status: item.status as Status,
    }));

    await dbClient.run.create({
        data: {
            id: runId, status, browser, platform, environment,
            featuresCount, scenariosCount, passCount, failCount, skipCount, stepsCount,
            auto: true, duration: runDuration,
        }
    });

    // console.log("tagsToCreate:", JSON.stringify(tagsToCreate, null, 2));
    // console.log("featuresToCreate:", JSON.stringify(featuresToCreate, null, 2));
    // console.log("scenariosToCreate:", JSON.stringify(scenariosToCreate, null, 2));
    // console.log("stepsToCreate:", JSON.stringify(stepsToCreate, null, 2));
    // console.log("scenarioStepsToCreate:", JSON.stringify(scenarioStepsToCreate, null, 2));
    // console.log("featureTagsToCreate:", JSON.stringify(featureTagsToCreate, null, 2));
    // console.log("scenarioTagsToCreate:", JSON.stringify(scenarioTagsToCreate, null, 2));
    console.log("runFeaturesToCreate:", JSON.stringify(runFeaturesToCreateMapped, null, 2));
    console.log("runScenariosToCreate:", JSON.stringify(runScenariosToCreateMapped, null, 2));
    console.log("runStepsToCreate:", JSON.stringify(runStepsToCreateMapped, null, 2));


    const uniqueSteps = Array.from(new Map(stepsToCreate.map(step => [step.id, step])).values());

    await dbClient.$transaction([
        dbClient.tag.createMany({ data: tagsToCreate, skipDuplicates: true }),
        dbClient.feature.createMany({ data: featuresToCreate, skipDuplicates: true }),
        dbClient.scenario.createMany({ data: scenariosToCreate, skipDuplicates: true }),
        dbClient.step.createMany({ data: uniqueSteps, skipDuplicates: true }),
        dbClient.scenarioStep.createMany({ data: scenarioStepsToCreate }),
        dbClient.featureTag.createMany({ data: featureTagsToCreate }),
        dbClient.scenarioTag.createMany({ data: scenarioTagsToCreate }),
        dbClient.runFeature.createMany({ data: runFeaturesToCreateMapped }),
        dbClient.runScenario.createMany({ data: runScenariosToCreateMapped }),
        dbClient.runStep.createMany({ data: runStepsToCreateMapped }),
        dbClient.run.update({
            where: { id: runId },
            data: { featuresCount, scenariosCount, passCount, failCount, skipCount, stepsCount, duration: runDuration }
        }),
    ]);

    console.log("Data successfully saved!");
}
