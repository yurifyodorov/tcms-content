import { Tag, TestData } from './types';
import { createId } from '@tests/shared/lib/id';

const collectTags = (testData: TestData): Tag[] => {
    const tagSet = new Set<string>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario) => {
            scenario.tags.forEach((tag) => {
                tagSet.add(tag.name);
            });
        });
    });

    return Array.from(tagSet).map((tagName) => ({
        id: createId(),
        name: tagName,
    }));
};

export { collectTags };