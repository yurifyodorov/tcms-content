import { ParsedScenario, ParsedStep } from './types';

const collectSteps = (scenarios: ParsedScenario[]): ParsedStep[] => {
    const stepsMap = new Map<string, ParsedStep>();

    scenarios.forEach(scenario => {
        scenario.steps.forEach(stepName => {
            if (!stepsMap.has(stepName)) {
                stepsMap.set(stepName, {
                    name: stepName,
                    keyword: "",
                    scenarioIds: [scenario.id]
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
