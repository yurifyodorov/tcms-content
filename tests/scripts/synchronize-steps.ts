import { dbClient } from "@tests/shared/lib/db";
import { Step } from "@tests/scripts/types"; // Убедитесь, что это Step
import { createId } from "@paralleldrive/cuid2";

export async function synchronizeSteps(testData: Step[]): Promise<void> { // Здесь обязательно Step[]
    // Шаг 1: Извлекаем все шаги из тестовых данных
    const stepIdsFromTestData = testData.map((step) => step.id);  // Идентификаторы шагов из тестовых данных
    console.log('Step IDs from test data:', stepIdsFromTestData);

    // Шаг 2: Получаем все шаги из базы данных
    const stepsInDb = await dbClient.step.findMany();
    console.log('Steps in DB:', stepsInDb.map(s => s.id));

    // Создаем мапу шагов из базы данных для быстрого поиска по id
    const stepMapFromDb = new Map<string, string>();
    stepsInDb.forEach((step) => {
        stepMapFromDb.set(step.id, step.id);
    });

    // Шаг 3: Определяем шаги, которые нужно удалить (если они не присутствуют в testData)
    const stepsToDelete = stepsInDb.filter(
        (step) => !stepIdsFromTestData.includes(step.id)
    );
    console.log('Steps to delete:', stepsToDelete.map(s => s.id));

    // Удаляем шаги, которых больше нет в тестовых данных
    if (stepsToDelete.length > 0) {
        await dbClient.step.deleteMany({
            where: {
                id: {
                    in: stepsToDelete.map((step) => step.id),
                },
            },
        });
        console.log(`Удалены шаги: ${stepsToDelete.map((step) => step.id).join(', ')}`);
    } else {
        console.log('Нет шагов, которые нужно удалить.');
    }

    // Шаг 4: Синхронизируем шаги из тестовых данных
    for (const step of testData) {
        const existingStepId = stepMapFromDb.get(step.id);

        if (existingStepId) {
            // Обновляем существующий шаг
            await dbClient.step.update({
                where: { id: existingStepId },
                data: {
                    keyword: step.keyword || 'Step',
                    name: step.name || '',
                    media: step.media || '', // Ошибки, связанные с типами, должны исчезнуть
                    scenarioIds: step.scenarioIds || [],
                },
            });
            console.log(`Обновлен шаг: ${step.id}`);
        } else {
            // Добавляем новый шаг
            const newStep = await dbClient.step.create({
                data: {
                    id: step.id || createId(),
                    keyword: step.keyword || 'Step',
                    name: step.name || '',
                    media: step.media || '', // Здесь также предполагается, что media - это строка
                    scenarioIds: step.scenarioIds || [],
                },
            });
            console.log(`Добавлен новый шаг: ${step.id}`);

            // Обновляем мапу для последующего использования
            stepMapFromDb.set(newStep.id, newStep.id);
        }
    }

    // Шаг 5: Логируем итоговое количество шагов в базе данных после синхронизации
    console.log(`Всего шагов в базе данных после синхронизации: ${stepMapFromDb.size}`);
}
