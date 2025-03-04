import { ParsedStep, TestData } from './types';
import { getDbClient } from '../shared/lib/db';

const collectSteps = async (testData: TestData, databaseUrl: string): Promise<ParsedStep[]> => {
    const dbClient = getDbClient(databaseUrl);

    const stepsInDb = await dbClient.step.findMany();
    const allSteps: ParsedStep[] = [];

    for (const feature of testData) {
        for (const scenario of feature.elements) {
            if (scenario.type !== 'scenario') {
                console.warn(`Skipping non-scenario element: ${scenario.type} - ${scenario.name}`);
                continue;
            }

            for (const step of scenario.steps) {
                const normalizedStepName = step.name.trim().toLowerCase();

                let stepInDb = stepsInDb.find(s => s.name.trim().toLowerCase() === normalizedStepName);

                if (!stepInDb) {
                    stepInDb = await dbClient.step.create({
                        data: {
                            name: step.name.trim(),
                            keyword: step.keyword,
                        },
                    });

                    stepsInDb.push(stepInDb);
                }

                const parsedStep: ParsedStep = {
                    id: stepInDb.id,
                    name: step.name.trim(),
                    keyword: step.keyword,
                    scenarioIds: [scenario.id],
                    media: step.media,
                };

                allSteps.push(parsedStep);
            }
        }
    }

    return allSteps;
};

export { collectSteps };
