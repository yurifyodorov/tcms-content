import { dbClient } from "@tests/shared/lib/db";
import { Scenario } from "@tests/scripts/types";

export async function synchronizeScenarios(testData: Scenario[]): Promise<void> {
    const scenarioIdsFromTestData = testData.map((scenario) => scenario.id);

    const scenariosInDb = await dbClient.scenario.findMany();

    const scenarioMapFromDb = new Map<string, string>();
    scenariosInDb.forEach((scenario) => {
        scenarioMapFromDb.set(scenario.id, scenario.id);
    });

    const scenariosToDelete = scenariosInDb.filter(
        (scenario) => !scenarioIdsFromTestData.includes(scenario.id)
    );

    if (scenariosToDelete.length > 0) {
        await dbClient.scenario.deleteMany({
            where: {
                id: {
                    in: scenariosToDelete.map((scenario) => scenario.id),
                },
            },
        });
    }

    for (const scenario of testData) {
        const existingScenarioId = scenarioMapFromDb.get(scenario.id);

        if (existingScenarioId) {
            await dbClient.scenario.update({
                where: { id: existingScenarioId },
                data: {
                    keyword: scenario.keyword,
                    name: scenario.name || '',
                    description: scenario.description || null,
                },
            });
        } else {
            const newScenario = await dbClient.scenario.create({
                data: {
                    id: scenario.id,
                    featureId: scenario.featureId,
                    keyword: scenario.keyword,
                    name: scenario.name || '',
                    description: scenario.description || null,
                },
            });

            scenarioMapFromDb.set(newScenario.id, newScenario.id);
        }
    }

    await dbClient.$disconnect();
}
