import {ParsedFeature, TestData} from './types';
import {dbClient} from '../shared/lib/db';
import {createId} from "@paralleldrive/cuid2";

const collectFeatures = async (testData: TestData): Promise<ParsedFeature[]> => {
    const featuresInDb = await dbClient.feature.findMany();
    const tagsInDb = await dbClient.tag.findMany();

    const tagMap = new Map<string, string>();
    tagsInDb.forEach(tag => tagMap.set(tag.name.trim(), tag.id));

    return testData.map(feature => {
        const featureDescription = feature.description ? feature.description.trim() : '';

        const existingFeature = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        const tagsToConnect = (feature.tags || [])
            .map(tag => {
                let tagId = tagMap.get(tag.name.trim());
                if (!tagId) {
                    console.warn(`⚠️ Tag "${tag.name}" not found in DB, it needs to be created.`);
                    return null;
                }
                return { id: tagId };
            })
            .filter((tag): tag is { id: string } => Boolean(tag));

        return {
            id: existingFeature ? existingFeature.id : createId(),
            name: feature.name,
            description: featureDescription,
            keyword: feature.keyword,
            tags: tagsToConnect.length > 0 ? {connect: tagsToConnect} : undefined,
            scenarios: feature.elements.map((scenario) => {
                const scenarioDescription = scenario.description ? scenario.description.trim() : '';

                const scenarioTagsToConnect = (scenario.tags || [])
                    .map(tag => {
                        let tagId = tagMap.get(tag.name.trim());
                        if (!tagId) {
                            console.warn(`⚠️ Tag "${tag.name}" not found in DB, it needs to be created.`);
                            return null;
                        }
                        return {id: tagId};
                    })
                    .filter((tag): tag is { id: string } => Boolean(tag));

                return {
                    id: scenario.id,
                    name: scenario.name,
                    description: scenarioDescription,
                    keyword: scenario.keyword,
                    tags: scenarioTagsToConnect.length > 0 ? {connect: scenarioTagsToConnect} : undefined
                };
            })
        };
    });
};

export { collectFeatures };
