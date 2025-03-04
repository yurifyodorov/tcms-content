import { createId } from '../shared/lib/id';
import { getDbClient } from '../shared/lib/db';

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

import { collectStepsResults } from './collect-steps-results';

export const scenarioMap = new Map<string, string>();

const saveResults = async (
    runId: string,
    browser: string,
    platform: string,
    environment: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> => {

    const maskString = (str: string) => {
        if (str.length <= 8) return '*'.repeat(str.length);
        return str.slice(0, 12) + '*'.repeat(12) + str.slice(-12);
    };

    console.log(`
        Run ID: ${runId}, 
        Browser: ${browser}, 
        Platform: ${platform}, 
        Env: ${environment}, 
        DB: ${maskString(databaseUrl)}
    `);

    const dbClient = getDbClient(databaseUrl);

    await synchronizeTags(testData, databaseUrl);
    await synchronizeFeatures(testData, databaseUrl);

    const tags = collectTags(testData);
    const features = await collectFeatures(testData, databaseUrl);
    const scenarios = await collectScenarios(testData, databaseUrl);

    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            const scenarioId = scenarios[featureIndex * feature.elements.length + scenarioIndex].id;
            scenarioMap.set(scenario.id, scenarioId);
        });
    });

    const steps = await collectSteps(testData, databaseUrl);
    await synchronizeSteps(steps, databaseUrl);

    const stepResults = await collectStepsResults(testData);
    // console.log("Collected Step Results:", stepResults);

    let featuresCount = 0;
    let scenariosCount = 0;
    let stepsCount = 0;

    let passCount = stepResults.filter(step => step.status === "passed").length;
    let failCount = stepResults.filter(step => step.status === "failed").length;
    let skipCount = stepResults.filter(step => step.status === "skipped").length;

    let status = 'completed';
    let duration = stepResults.reduce((total, step) => total + step.duration, 0);

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

        let featureStatus: Status = 'passed'; // Assume passed unless any scenario fails

        runFeaturesToCreate.push({
            id: createId(),
            featureId,
            runId: runId,
            status: featureStatus,
            duration: 0,
            createdAt: new Date()
        });

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

            let scenarioStatus: Status = 'untested';
            let scenarioDuration: number = 0;

            for (const tag of scenario.tags || []) {
                let tagId = tagMap.get(tag.name.trim());
                if (!tagId) {
                    tagId = (await dbClient.tag.create({ data: { name: tag.name.trim() } })).id;
                    tagMap.set(tag.name.trim(), tagId);
                }
                scenarioTagsToCreate.push({ scenarioId, tagId });
            }

            for (const [index, step] of scenario.steps.entries()) {
                const stepName = step.name.trim().toLowerCase();
                const stepData = steps.find(s => s.name.trim().toLowerCase() === stepName);

                if (!stepData) {
                    console.error(`Step "${step.name}" not found in steps`);
                    continue;
                }

                scenarioStepsToCreate.push({ scenarioId, stepId: stepData.id });

                runStepsToCreate.push({
                    id: createId(),
                    stepId: stepData.id,
                    scenarioId,
                    runId,
                    status: stepResults[index].status as Status,
                    duration: stepResults[index].duration,
                    createdAt: new Date(),
                    errorMessage: null,
                    stackTrace: null
                });

                stepsCount++;
                scenarioDuration += stepResults[index].duration;

                if (!stepsToCreate.some(s => s.id === stepData.id)) {
                    stepsToCreate.push({
                        id: stepData.id,
                        scenarioIds: stepData.scenarioIds,
                        keyword: stepData.keyword,
                        name: stepData.name,
                        media: stepData.media
                    });
                }

                if (stepResults[index].status === 'failed') {
                    scenarioStatus = 'failed';
                }

                if (stepResults[index].status === 'skipped' && scenarioStatus !== 'failed') {
                    scenarioStatus = 'skipped';
                }
            }

            if (scenarioStatus !== 'failed' && scenarioStatus !== 'skipped') {
                scenarioStatus = 'passed';
            }

            runScenariosToCreate.push({
                id: createId(),
                scenarioId,
                runId: runId,
                status: scenarioStatus,
                duration: scenarioDuration,
                createdAt: new Date()
            });

            scenariosCount++;

            // Check if scenario was failed, if so, mark the feature as failed
            if (scenarioStatus === 'failed') {
                featureStatus = 'failed';
            }
        }

        // If no scenario was failed, we can keep the feature status as passed
        if (featureStatus !== 'failed') {
            featureStatus = 'passed';
        }

        // Update runFeature status after processing all scenarios
        runFeaturesToCreate.push({
            id: createId(),
            featureId,
            runId: runId,
            status: featureStatus, // Set the final status for the feature
            duration: 0,
            createdAt: new Date()
        });
    }

    await synchronizeScenarios(
        scenariosToCreate.map(scenario => ({
            ...scenario,
            steps: [],
            tags: [],
            type: 'Scenario' as const
        })),
        databaseUrl
    );

    // Handle failed status if necessary
    if (failCount > 0) {
        status = 'failed';
    }

    const tagsToCreate = Array.from(tagsSet).map(tagName => ({
        name: tagName,
    }));

    await dbClient.run.create({
        data: {
            id: runId, status, browser, platform, environment,
            featuresCount, scenariosCount, stepsCount, passCount, failCount, skipCount,
            auto: true, duration,
        }
    });

    // console.log("tagsToCreate:", JSON.stringify(tagsToCreate, null, 2));
    // console.log("featuresToCreate:", JSON.stringify(featuresToCreate, null, 2));
    // console.log("scenariosToCreate:", JSON.stringify(scenariosToCreate, null, 2));
    // console.log("stepsToCreate:", JSON.stringify(stepsToCreate, null, 2));
    // console.log("scenarioStepsToCreate:", JSON.stringify(scenarioStepsToCreate, null, 2));
    // console.log("featureTagsToCreate:", JSON.stringify(featureTagsToCreate, null, 2));
    // console.log("scenarioTagsToCreate:", JSON.stringify(scenarioTagsToCreate, null, 2));
    // console.log("runFeaturesToCreate:", JSON.stringify(runFeaturesToCreate, null, 2));
    // console.log("runScenariosToCreate:", JSON.stringify(runScenariosToCreat, null, 2));
    // console.log("runStepsToCreate:", JSON.stringify(runStepsToCreate, null, 2));

    const uniqueSteps = Array.from(new Map(
        stepsToCreate.map(step => [`${step.name.trim().toLowerCase()}-${step.keyword.trim().toLowerCase()}`, step])
    ).values());

    await dbClient.$transaction([
        dbClient.tag.createMany({ data: tagsToCreate, skipDuplicates: true }),
        dbClient.feature.createMany({ data: featuresToCreate, skipDuplicates: true }),
        dbClient.scenario.createMany({ data: scenariosToCreate, skipDuplicates: true }),
        dbClient.step.createMany({ data: uniqueSteps, skipDuplicates: true }),
        dbClient.scenarioStep.createMany({ data: scenarioStepsToCreate }),
        dbClient.featureTag.createMany({ data: featureTagsToCreate }),
        dbClient.scenarioTag.createMany({ data: scenarioTagsToCreate }),

        dbClient.runFeature.createMany({
            data: runFeaturesToCreate.map(item => ({
                id: item.id,
                featureId: item.featureId,
                runId: item.runId,
                status: item.status as Status,
                duration: item.duration,
                createdAt: item.createdAt,
            })),
            skipDuplicates: true
        }),

        dbClient.runScenario.createMany({
            data: runScenariosToCreate.map(item => ({
                id: item.id,
                scenarioId: item.scenarioId,
                runId: item.runId,
                status: item.status as Status,
                duration: item.duration,
                createdAt: item.createdAt,
            })),
            skipDuplicates: true
        }),

        dbClient.runStep.createMany({
            data: runStepsToCreate.map(item => ({
                id: item.id,
                stepId: item.stepId,
                scenarioId: item.scenarioId,
                runId: item.runId,
                status: item.status as Status,
                duration: item.duration,
                createdAt: item.createdAt,
                errorMessage: item.errorMessage,
                stackTrace: item.stackTrace,
            })),
            skipDuplicates: true
        }),

        dbClient.run.update({
            where: { id: runId },
            data: {
                featuresCount,
                scenariosCount,
                stepsCount,
                passCount,
                failCount,
                skipCount,
                duration
            },
        }),
    ]);

    await dbClient.$disconnect();

    console.log("Data successfully saved!");
}

export { saveResults };