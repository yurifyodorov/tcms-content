import { TestData, ParsedFeature } from './types';
import { dbClient } from '../shared/lib/db';
import { createId } from "@paralleldrive/cuid2";

const collectFeatures = async (testData: TestData): Promise<ParsedFeature[]> => {
    const featuresInDb = await dbClient.feature.findMany();

    // console.log('Features in DB:', JSON.stringify(featuresInDb, null, 2));

    const allFeatures: ParsedFeature[] = [];

    for (const feature of testData) {
        const existingFeature = featuresInDb.find(f => f.name.trim().toLowerCase() === feature.name.trim().toLowerCase());

        const tagsToConnect = [];

        for (const tag of feature.tags || []) {
            const existingTag = await dbClient.tag.findUnique({ where: { name: tag.name } });
            if (existingTag) {
                tagsToConnect.push({ id: existingTag.id });
            } else {
                const newTag = await dbClient.tag.create({ data: { name: tag.name } });
                tagsToConnect.push({ id: newTag.id });
            }
        }

        // console.log(`Tags for feature "${feature.name}":`, tagsToConnect);

        const parsedFeature: ParsedFeature = {
            id: existingFeature ? existingFeature.id : createId(),
            name: feature.name,
            description: feature.description || '',
            keyword: feature.keyword,
            tags: {
                connect: tagsToConnect
            }
        };

        allFeatures.push(parsedFeature);
    }

    // console.log('Collected Features:', JSON.stringify(allFeatures, null, 2));

    return allFeatures;
};

export { collectFeatures };
