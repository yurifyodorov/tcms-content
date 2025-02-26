import { Feature, Scenario, Step } from '@tests/scripts/types';
import { createId } from '@tests/shared/lib/id';

const collectSteps = (testData: Feature[]): Map<string, Step> => {
    const stepsMap = new Map<string, Step>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario: Scenario) => {
            scenario.steps.forEach((step) => {
                const stepName = step.name.trim();

                if (!stepsMap.has(stepName)) {
                    const stepId = step.id || createId();
                    stepsMap.set(stepName, {
                        id: stepId,
                        name: stepName,
                        media: step.media || '',
                        keyword: step.keyword || '',
                        scenarioIds: [],
                    });
                }

                const existingStep = stepsMap.get(stepName);
                if (existingStep) {
                    existingStep.scenarioIds.push(scenario.id);
                }
            });
        });
    });

    return stepsMap;
};

export { collectSteps };
