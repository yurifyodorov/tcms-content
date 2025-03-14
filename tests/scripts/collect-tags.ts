import { Tag, TestData } from './types';

const collectTags = (testData: TestData): Tag[] => {
    const tagSet = new Set<string>();

    testData.forEach((feature) => {
        feature.elements.forEach((scenario) => {
            scenario.tags.forEach((tag) => {
                tagSet.add(tag.name);
            });
        });
    });

    const collectedTags = Array.from(tagSet).map((tagName) => ({
        id: tagName,
        name: tagName,
    }));

    // console.log("Собранные теги из тестов:", collectedTags);

    return collectedTags;
};

export { collectTags };
