import { Tag, TestData } from './types';

const collectTags = (testData: TestData): Tag[] => {
    const tagSet = new Set<string>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario) => {
            scenario.tags.forEach((tag) => {
                tagSet.add(tag.name.trim());
            });
        });
    });

    const collectedTags = Array.from(tagSet).map((tagName) => ({
        id: tagName,
        name: tagName,
    }));

    return collectedTags;
};

export { collectTags };
