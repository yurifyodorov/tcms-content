import { TestData, ParsedScenario } from './types';
import { createId } from '@tests/shared/lib/id';


const collectScenarios = (testData: TestData): ParsedScenario[] => {
    const scenarios: ParsedScenario[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            const steps = scenario.steps.map(step => step.name);
            const status = scenario.steps.every(step => step.result.status === 'passed')
                ? 'passed'
                : scenario.steps.some(step => step.result.status === 'failed')
                    ? 'failed'
                    : 'skipped';

            scenarios.push({
                id: createId(),
                name: scenario.name,
                steps,
                status
            });
        });
    });

    return scenarios;
};

export { collectScenarios };
export type { ParsedScenario };
