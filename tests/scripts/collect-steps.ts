import { Feature, Scenario, Step } from '@tests/scripts/types';
import { createId } from '@tests/shared/lib/id';

const collectSteps = (testData: Feature[]): Step[] => {
    const stepsMap = new Map<string, Step>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario: Scenario) => {
            if (scenario.steps) {
                scenario.steps.forEach((step) => {
                    const stepName = step.name;

                    if (!stepsMap.has(stepName)) {
                        stepsMap.set(stepName, {
                            id: createId(),
                            name: step.name,
                            media: step.media || '',
                            keyword: step.keyword,
                        });
                    }
                });
            }
        });
    });

    return Array.from(stepsMap.values());
};

export { collectSteps };
