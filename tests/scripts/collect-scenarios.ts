import { TestData, ParsedScenario } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectScenarios = async (testData: TestData): Promise<ParsedScenario[]> => {
    const featuresInDb = await dbClient.feature.findMany();

    return testData.flatMap(feature => {
        const featureInDb = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        if (!featureInDb) {
            console.error(`Feature "${feature.name}" not found in the database.`);
            return [];
        }

        return feature.elements
            .filter(scenario => scenario.keyword === 'Scenario' || scenario.keyword === 'Scenario Outline')
            .map(scenario => ({
                id: createId(),
                featureId: featureInDb.id,
                keyword: scenario.keyword,
                name: scenario.name,
                tags: {
                    connect: scenario.tags ? scenario.tags.map(tag => ({ id: tag.id })) : []
                }
            }));
    });
};

export { collectScenarios };
