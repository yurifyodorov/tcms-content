import { TestData, ParsedScenario } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectScenarios = async (testData: TestData): Promise<ParsedScenario[]> => {
    const featuresInDb = await dbClient.feature.findMany();

    const allScenarios: ParsedScenario[] = [];

    testData.forEach(feature => {
        const featureInDb = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        if (!featureInDb) {
            console.error(`Feature "${feature.name}" not found in the database.`);
            return;
        }

        // Логирование данных фичи
        // console.log(`Обработка фичи: "${feature.name}" с ID: ${featureInDb.id}`);

        feature.elements
            .filter(scenario => scenario.keyword === 'Scenario' || scenario.keyword === 'Scenario Outline')
            .forEach(scenario => {
                const parsedScenario: ParsedScenario = {
                    id: createId(),
                    featureId: featureInDb.id,
                    keyword: scenario.keyword,
                    name: scenario.name,
                    tags: {
                        connect: scenario.tags ? scenario.tags.map(tag => ({ id: tag.id })) : []
                    }
                };

                allScenarios.push(parsedScenario);
            });
    });

    // Логирование всех собранных сценариев в формате JSON
    // console.log('Collected Scenarios:', JSON.stringify(allScenarios, null, 2));

    return allScenarios;
};

export { collectScenarios };
