import { TestData, StepResult } from "./types";

const collectStepsResults = async (testData: TestData): Promise<{ status: string, duration: number }[]> => {
    let results: { status: string, duration: number }[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            (scenario.steps as StepResult[]).forEach(step => {
                const { status, duration } = step.result;

                const durationInMs = Math.floor(duration / 1000000);

                results.push({ status, duration: durationInMs });
            });
        });
    });

    return results;
}

export { collectStepsResults };
