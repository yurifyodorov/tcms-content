import { ParsedScenario, ParsedStep } from './types';
import { createId } from '@tests/shared/lib/id';

const collectSteps = (scenarios: ParsedScenario[]): ParsedStep[] => {
    const stepsMap = new Map<string, ParsedStep>();

    scenarios.forEach(scenario => {
        scenario.steps.forEach(stepName => {
            if (!stepsMap.has(stepName)) {
                stepsMap.set(stepName, {
                    id: createId(),
                    name: stepName,
                    keyword: "",
                    scenarioIds: [scenario.id],
                    status: scenario.status,
                });
            } else {
                stepsMap.get(stepName)!.scenarioIds.push(scenario.id);
            }
        });
    });

    return Array.from(stepsMap.values());
};

export { collectSteps };
export type { ParsedStep };
