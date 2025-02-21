import { TestData } from './types';
import { dbClient } from '@tests/shared/lib/db';
import { createId } from '@tests/shared/lib/id';

import { collectFeatures } from "@tests/scripts/new/collect-features";
import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';

// TODO: используй рабочий код отсюда tests/scripts/save-results.ts

const saveResults = (
    runId: string,
    browser: string,
    platform: string,
    databaseUrl: string,
    testData: TestData
): void => {
    console.log(`runId: ${runId}`);
    console.log(`browser: ${browser}`);
    console.log(`platform: ${platform}`);
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

    const steps = collectSteps(scenarios);
    console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    console.log("✅ Функция saveResults выполнена успешно!");
};

export { saveResults };
