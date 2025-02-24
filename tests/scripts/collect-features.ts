import { TestData, ParsedFeature } from './types';
import { createId } from '@tests/shared/lib/id';

const collectFeatures = (testData: TestData): ParsedFeature[] => {
    return testData.map(feature => ({
        id: createId(),
        name: feature.name,
        description: feature.description || '',
        keyword: feature.keyword,
        tags: {
            connect: feature.tags?.map(tag => ({ id: tag.id })) || []
        }
    }));
};

export { collectFeatures };
