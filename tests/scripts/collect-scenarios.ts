import { TestData, ParsedScenario } from './types';
import { dbClient } from '../shared/lib/db';

const collectScenarios = async (testData: TestData): Promise<ParsedScenario[]> => {
    const featuresInDb = await dbClient.feature.findMany();
    const tagsInDb = await dbClient.tag.findMany();

    const tagMap = new Map<string, string>();
    tagsInDb.forEach(tag => tagMap.set(tag.name.trim(), tag.id));

    const allScenarios: ParsedScenario[] = [];

    testData.forEach(feature => {
        const featureInDb = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        if (!featureInDb) {
            console.error(`Feature "${feature.name}" not found in the database.`);
            return;
        }

        feature.elements.forEach(scenario => {
            if (scenario.type === 'scenario') {
                const tagsToConnect = (scenario.tags || [])
                    .map(tag => {
                        let tagId = tagMap.get(tag.name.trim());
                        if (!tagId) {
                            console.warn(`⚠️ Tag "${tag.name}" not found in DB, it needs to be created.`);
                            return null;
                        }
                        return { id: tagId };
                    })
                    .filter((tag): tag is { id: string } => Boolean(tag));

                const scenarioDescription = scenario.description ? scenario.description.trim() : '';

                const parsedScenario: ParsedScenario = {
                    id: scenario.id,
                    featureId: featureInDb.id,
                    keyword: scenario.keyword,
                    name: scenario.name,
                    description: scenarioDescription,
                    tags: tagsToConnect.length > 0 ? { connect: tagsToConnect } : undefined
                };

                allScenarios.push(parsedScenario);
            } else {
                console.warn(`Skipping non-scenario element with type: ${scenario.type} - ${scenario.name}`);
            }
        });
    });

    return allScenarios;
};

export { collectScenarios };
