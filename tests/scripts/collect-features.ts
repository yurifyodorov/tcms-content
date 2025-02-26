import { ParsedFeature, TestData } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectFeatures = async (testData: TestData): Promise<ParsedFeature[]> => {
    const featuresInDb = await dbClient.feature.findMany();
    const tagsInDb = await dbClient.tag.findMany();

    const tagMap = new Map<string, string>();
    tagsInDb.forEach(tag => tagMap.set(tag.name.trim(), tag.id));

    return testData.map(feature => {
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
            description: feature.description || '',
            keyword: feature.keyword,
            tags: tagsToConnect.length > 0 ? { connect: tagsToConnect } : undefined
        };
    });
};

export { collectFeatures };
