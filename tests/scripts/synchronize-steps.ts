import { dbClient } from "@tests/shared/lib/db";
import { Step } from "@tests/scripts/types"; // Убедитесь, что это Step
import { createId } from "@paralleldrive/cuid2";

export async function synchronizeSteps(testData: Step[]): Promise<void> {

    const stepIdsFromTestData = testData.map((step) => step.id);

    const stepsInDb = await dbClient.step.findMany();

    const stepMapFromDb = new Map<string, string>();
    stepsInDb.forEach((step) => {
        stepMapFromDb.set(step.id, step.id);
    });

    const stepsToDelete = stepsInDb.filter(
        (step) => !stepIdsFromTestData.includes(step.id)
    );

    if (stepsToDelete.length > 0) {
        await dbClient.step.deleteMany({
            where: {
                id: {
                    in: stepsToDelete.map((step) => step.id),
                },
            },
        });
    }

    for (const step of testData) {
        const existingStepId = stepMapFromDb.get(step.id);

        if (existingStepId) {
            await dbClient.step.update({
                where: { id: existingStepId },
                data: {
                    keyword: step.keyword || 'Step',
                    name: step.name || '',
                    media: step.media || '',
                    scenarioIds: step.scenarioIds || [],
                },
            });
        } else {
            // Добавляем новый шаг
            const newStep = await dbClient.step.create({
                data: {
                    id: step.id || createId(),
                    keyword: step.keyword || 'Step',
                    name: step.name || '',
                    media: step.media || '',
                    scenarioIds: step.scenarioIds || [],
                },
            });

            stepMapFromDb.set(newStep.id, newStep.id);
        }
    }
}