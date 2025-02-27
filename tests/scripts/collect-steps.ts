import { Feature, Scenario, Step } from '@tests/scripts/types';
import { scenarioMap } from './save-results';

const collectSteps = (testData: Feature[]): Map<string, Step> => {
    const stepsMap = new Map<string, Step>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario: Scenario) => {
            scenario.steps.forEach((step) => {
                const stepName = step.name.trim();

                if (!stepsMap.has(stepName)) {
                    const stepId = step.id || stepName;
                    stepsMap.set(stepName, {
                        id: stepId,
                        name: stepName,
                        media: step.media || 'https://s3.timeweb.cloud/ca1c67e1-tcms-images/content/bafb763a54d1cd106a9493c2862ad757.png',
                        keyword: step.keyword || '',
                        scenarioIds: [],
                    });
                }

                const existingStep = stepsMap.get(stepName);
                if (existingStep) {
                    const realScenarioId = scenarioMap.get(scenario.id);
                    if (realScenarioId) {
                        existingStep.scenarioIds.push(realScenarioId);
                    } else {
                        console.error(`Scenario ID not found for scenario: ${scenario.id}`);
                    }
                }
            });
        });
    });

    return stepsMap;
};

export { collectSteps };
