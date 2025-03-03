import { ParsedStep, TestData } from '@tests/scripts/types';
import { dbClient } from "@tests/shared/lib/db";

const collectSteps = async (testData: TestData): Promise<ParsedStep[]> => {
    const stepsInDb = await dbClient.step.findMany();
    const allSteps: ParsedStep[] = [];

    // Логирование всех шагов в базе данных для отладки
    console.log("Steps in database:", stepsInDb.map(step => step.name.trim()));

    for (const feature of testData) {
        for (const scenario of feature.elements) {
            if (scenario.type !== 'scenario') {
                console.warn(`Skipping non-scenario element: ${scenario.type} - ${scenario.name}`);
                continue;
            }

            for (const step of scenario.steps) {
                const normalizedStepName = step.name.trim().toLowerCase();

                // Логируем каждый шаг, который мы ищем
                console.log(`Searching for step: "${normalizedStepName}"`);

                // Ищем шаг в базе данных
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

                    // Добавляем новый шаг в локальный массив
                    stepsInDb.push(stepInDb); // Сразу добавляем новый шаг в массив шагов в базе
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

    // Логируем итоговый список собранных шагов
    console.log("Collected steps:", JSON.stringify(allSteps, null, 2));

    return allSteps;
};

export { collectSteps };
