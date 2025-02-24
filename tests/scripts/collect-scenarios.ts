import { TestData, ParsedScenario } from './types';
import { createId } from '@tests/shared/lib/id';

const collectScenarios = (testData: TestData): ParsedScenario[] => {
    const scenarios: ParsedScenario[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            scenarios.push({
                id: createId(),
                name: scenario.name,
                tags: scenario.tags || [],
            });
        });
    });

    return scenarios;
};

export { collectScenarios };
export type { ParsedScenario };
