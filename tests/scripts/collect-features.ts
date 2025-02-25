import { TestData, ParsedFeature } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectFeatures = async (testData: TestData): Promise<ParsedFeature[]> => {
    const featuresInDb = await dbClient.feature.findMany();

    console.log('Features in DB:', JSON.stringify(featuresInDb, null, 2));

    const allFeatures: ParsedFeature[] = testData.map(feature => {
        const existingFeature = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        return {
            id: existingFeature ? existingFeature.id : createId(),
            name: feature.name,
            description: feature.description || '',
            keyword: feature.keyword,
            tags: {
                connect: feature.tags?.map(tag => ({ id: tag.id })) || []
            }
        };
    });

    console.log('Collected Features:', JSON.stringify(allFeatures, null, 2));

    return allFeatures;
};

export { collectFeatures };
