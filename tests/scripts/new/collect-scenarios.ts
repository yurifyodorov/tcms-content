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

    console.log("Parsed scenarios:", JSON.stringify(scenarios, null, 2));
    return scenarios;
};

export { collectScenarios };
export type { ParsedScenario };
