import { dbClient } from '../shared/lib/db';
import { createId } from '../shared/lib/id';
import { TestData } from "@tests/scripts/types";

import { collectFeatures } from "./collect-features";
import { collectScenarios } from './collect-scenarios';
// import { collectSteps } from './collect-steps';

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

    const scenarios = collectScenarios(testData);
    console.log("Scenarios to be saved:", JSON.stringify(scenarios, null, 2));

    const scenarioMap = new Map<string, string>();
    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            scenarioMap.set(scenario.id, scenarios[featureIndex * feature.elements.length + scenarioIndex].id);
        });
    });

    const features = collectFeatures(testData, scenarioMap);
    console.log("Features to be saved:", JSON.stringify(features, null, 2));

    // const steps = collectSteps(scenarios);
    // console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    let featuresCount = 0;
    let scenariosCount = 0;
    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let stepsCount = 0;

    let featuresToCreate = [];
    let scenariosToCreate = [];
    // let stepsToCreate = [];

    let status = 'completed';

    let runDuration = 0;

    for (const feature of testData) {

        featuresCount++;

        const featureId = createId();

        const tags = (feature.tags || []).map((tag: { name: string }) => tag.name);

        const featureData = {
            id: featureId,
            keyword: feature.keyword,
            name: feature.name,
            description: feature.description || '',
            tags: tags,
        };

        featuresToCreate.push(featureData);

        for (const scenario of feature.elements) {
            const scenarioId = createId();

            const tags = (scenario.tags || []).map((tag: { name: string }) => tag.name);

            const scenarioData = {
                id: scenarioId,
                featureId: featureId,
                keyword: feature.keyword,
                name: scenario.name,
                tags: tags,
            };

            scenariosToCreate.push(scenarioData);

            // for (const step of scenario.steps) {
            //
            //     const stepData = {
            //         id: createId(),
            //         scenarioId: scenarioId,
            //         keyword: step.keyword,
            //         name: step.name,
            //         media: step.media
            //     };
            //
            //     stepsToCreate.push(stepData);
            //     stepsCount++;
            // }

            scenariosCount++;
        }
    }

    if (failCount > 0) {
        status = 'failed';
    }

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
        dbClient.feature.createMany({ data: featuresToCreate }),
        dbClient.scenario.createMany({ data: scenariosToCreate }),
        // dbClient.step.createMany({ data: stepsToCreate }),
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