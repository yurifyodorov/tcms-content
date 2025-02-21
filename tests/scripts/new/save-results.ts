import { TestData } from './types';
import { dbClient } from '@tests/shared/lib/db';
import { createId } from '@tests/shared/lib/id';

import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';

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
    testData.forEach(feature => {
        feature.elements.forEach((scenario, index) => {
            scenarioMap.set(scenario.id, scenarios[index].id);
        });
    });

    const steps = collectSteps(scenarios);
    console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    console.log("✅ Функция saveResults выполнена успешно!");
};

export { saveResults };
