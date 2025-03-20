import { TestData, StepResult } from "./types";

interface ScenarioResult {
    scenarioName: string;
    steps: { status: string; duration: number; errorMessage?: string }[];
}

const collectStepsResults = async (testData: TestData): Promise<ScenarioResult[]> => {
    let results: ScenarioResult[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            const steps = (scenario.steps as StepResult[]).map(step => {
                const { status, duration, error_message } = step.result;
                const durationInMs = Math.floor(duration / 1000000);
                return error_message
                    ? { status, duration: durationInMs, errorMessage: error_message }
                    : { status, duration: durationInMs };
            });

            results.push({
                scenarioName: scenario.name,
                steps,
            });
        });
    });

    return results;
}

export { collectStepsResults };