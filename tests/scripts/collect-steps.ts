import {Feature, Scenario, ParsedStep, ParsedScenario} from '@tests/scripts/types';
import { createId } from '@tests/shared/lib/id';

const collectSteps = (testData: Feature[], allScenarios: ParsedScenario[]): ParsedStep[] => {
    const stepsMap = new Map<string, ParsedStep>();
    const scenarioIdMap = new Map<string, string>();

    allScenarios.forEach(scenario => {
        scenarioIdMap.set(scenario.name, scenario.id);
    });

    testData.forEach((feature) => {
        feature.elements.forEach((scenario: Scenario) => {
            if (scenario.steps) {
                scenario.steps.forEach((step) => {
                    const stepName = step.name;

                    if (!stepsMap.has(stepName)) {
                        stepsMap.set(stepName, {
                            id: createId(),
                            name: step.name,
                            keyword: step.keyword,
                            media: step.media || '',
                            scenarioIds: [scenarioIdMap.get(scenario.name) || ''],
                        });
                    } else {
                        const existingStep = stepsMap.get(stepName);
                        if (existingStep) {
                            const scenarioId = scenarioIdMap.get(scenario.name) || '';
                            if (scenarioId && !existingStep.scenarioIds.includes(scenarioId)) {
                                existingStep.scenarioIds.push(scenarioId);
                            }
                        }
                    }
                });
            }
        });
    });

    const collectedSteps = Array.from(stepsMap.values());

    // console.log('Собранные шаги:', JSON.stringify(collectedSteps, null, 2));

    return collectedSteps;
};

export { collectSteps };
