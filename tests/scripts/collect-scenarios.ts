import { TestData, ParsedScenario } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectScenarios = async (testData: TestData): Promise<ParsedScenario[]> => {
    const featuresInDb = await dbClient.feature.findMany();

    const allScenarios: ParsedScenario[] = [];

    for (const feature of testData) {
        const featureInDb = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        if (!featureInDb) {
            console.error(`Feature "${feature.name}" not found in the database.`);
            continue;
        }

        console.log(`Обработка фичи: "${feature.name}" с ID: ${featureInDb.id}`);

        for (const scenario of feature.elements.filter(scenario => scenario.keyword === 'Scenario' || scenario.keyword === 'Scenario Outline')) {
            const tagsToConnect = [];

            for (const tag of scenario.tags || []) {
                const existingTag = await dbClient.tag.findUnique({ where: { name: tag.name } });
                if (existingTag) {
                    tagsToConnect.push({ id: existingTag.id });
                } else {
                    const newTag = await dbClient.tag.create({ data: { name: tag.name } });
                    tagsToConnect.push({ id: newTag.id });
                }
            }

            console.log(`Tags for scenario "${scenario.name}":`, tagsToConnect);

            const parsedScenario: ParsedScenario = {
                id: createId(),
                featureId: featureInDb.id,
                keyword: scenario.keyword,
                name: scenario.name,
                tags: {
                    connect: tagsToConnect
                }
            };

            allScenarios.push(parsedScenario);
        }
    }

    console.log('Collected Scenarios:', JSON.stringify(allScenarios, null, 2));

    return allScenarios;
};

export { collectScenarios };
