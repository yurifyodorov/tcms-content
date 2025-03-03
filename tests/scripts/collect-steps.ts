import { ParsedStep, TestData } from '@tests/scripts/types';
import { dbClient } from "@tests/shared/lib/db";

const collectSteps = async (testData: TestData): Promise<ParsedStep[]> => {
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
                    console.error(`Step "${step.name}" not found in the database. Adding it now.`);

                    // Если шаг не найден, сохраняем его в базу данных
                    stepInDb = await dbClient.step.create({
                        data: {
                            name: step.name.trim(),
                            keyword: step.keyword,
                        },
                    });

                    stepsInDb.push(stepInDb);
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
            }
        }
    }

    return allSteps;
};

export { collectSteps };
