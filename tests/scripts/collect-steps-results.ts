import { TestData, StepResult } from "@tests/scripts/types";

const collectStepsResults = async (testData: TestData): Promise<{ status: string, duration: number }[]> => {
    let results: { status: string, duration: number }[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            (scenario.steps as StepResult[]).forEach(step => {
                const { status, duration } = step.result;
                results.push({ status, duration });
            });
        });
    });

    return results;
}

export { collectStepsResults };
