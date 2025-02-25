import { dbClient } from "@tests/shared/lib/db";
import { TestData } from "@tests/scripts/types";
import { createId } from "@paralleldrive/cuid2";
import { collectScenarios } from './collect-scenarios';

export async function synchronizeScenarios(testData: TestData): Promise<void> {
    const scenariosFromTestData = await collectScenarios(testData);

    const scenariosInDb = await dbClient.scenario.findMany({ select: { id: true, name: true, featureId: true } });
    const scenarioMap = new Map(scenariosInDb.map(scenario => [`${scenario.name.trim()}_${scenario.featureId}`, scenario.id]));

    const scenariosToDelete = scenariosInDb.filter(scenario =>
        !scenariosFromTestData.some(s => s.name === scenario.name.trim() && s.featureId === scenario.featureId)
    );

    if (scenariosToDelete.length > 0) {
        await dbClient.scenario.deleteMany({
            where: { id: { in: scenariosToDelete.map(scenario => scenario.id) } }
        });
        // console.log(`Удалены сценарии с неправильным featureId: ${scenariosToDelete.map(s => s.name).join(", ")}`);
    }

    for (const { name, featureId, keyword } of scenariosFromTestData) {
        const existingScenarioId = scenarioMap.get(`${name}_${featureId}`);

        if (!existingScenarioId) {
            const newScenario = await dbClient.scenario.create({
                data: {
                    id: createId(),
                    featureId: featureId,
                    keyword: keyword,
                    name: name,
                }
            });
            // console.log(`Добавлен новый сценарий: ${name}`);
            scenarioMap.set(`${name}_${featureId}`, newScenario.id);
        } else {
            // console.log(`Сценарий "${name}" с featureId "${featureId}" уже существует. Обновляем.`);
            await dbClient.scenario.update({
                where: { id: existingScenarioId },
                data: {
                    featureId: featureId,
                    keyword: keyword,
                    name: name,
                },
            });
        }
    }

    // console.log(`Всего сценариев в базе данных после синхронизации: ${scenarioMap.size}`);
}
