import { ParsedStep, TestData } from '@tests/scripts/types';
import { dbClient } from "@tests/shared/lib/db";

const collectSteps = async (testData: TestData): Promise<ParsedStep[]> => {
    const stepsInDb = await dbClient.step.findMany();
    const allSteps: ParsedStep[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            if (scenario.type !== 'scenario') {
                console.warn(`Skipping non-scenario element: ${scenario.type} - ${scenario.name}`);
                return;
            }

            scenario.steps.forEach(step => {
                const stepInDb = stepsInDb.find(s => s.name.trim().toLowerCase() === step.name.trim().toLowerCase());

                if (!stepInDb) {
                    console.error(`Step "${step.name}" not found in the database.`);
                    return;
                }

                const duration = 0;
                const status = 'unknown';

                const parsedStep: ParsedStep = {
                    id: stepInDb.id,
                    name: step.name.trim(),
                    keyword: step.keyword,
                    scenarioIds: [scenario.id],
                    media: step.media,
                };


                allSteps.push(parsedStep);
            });
        });
    });

    return allSteps;
};

export { collectSteps };
