import { dbClient } from '../shared/lib/db';
import { TestData } from './types';
import { collectTags } from "@tests/scripts/collect-tags";

export async function synchronizeTags(testData: TestData): Promise<void> {

    const tagsFromTests = collectTags(testData);
    const tagsSetFromTests = new Set<string>();
    tagsFromTests.forEach(tag => {
        tagsSetFromTests.add(tag.name.trim());
    });

    const tagsInDb = await dbClient.tag.findMany();
    const tagMapFromDb = new Map<string, string>();
    tagsInDb.forEach(tag => {
        tagMapFromDb.set(tag.name.trim(), tag.id);
    });

    const tagsToDelete = tagsInDb.filter(tag => !tagsSetFromTests.has(tag.name.trim()));

    if (tagsToDelete.length > 0) {
        await dbClient.featureTag.deleteMany({
            where: {
                tagId: {
                    in: tagsToDelete.map(tag => tag.id),
                },
            },
        });

        await dbClient.scenarioTag.deleteMany({
            where: {
                tagId: {
                    in: tagsToDelete.map(tag => tag.id),
                },
            },
        });

        await dbClient.tag.deleteMany({
            where: {
                id: {
                    in: tagsToDelete.map(tag => tag.id),
                },
            },
        });

        console.log(`Удалены теги: ${tagsToDelete.map(tag => tag.name).join(', ')}`);
    }

    const newTagsToAdd = Array.from(tagsSetFromTests)
        .filter(tagName => !tagMapFromDb.has(tagName))
        .map(tagName => ({ name: tagName }));

    if (newTagsToAdd.length > 0) {
        await dbClient.tag.createMany({
            data: newTagsToAdd,
            skipDuplicates: true,
        });

        // console.log(`Добавлены новые теги: ${newTagsToAdd.map(tag => tag.name).join(', ')}`);
    }

    const existingTags = tagsInDb.filter(tag => tagsSetFromTests.has(tag.name.trim()));

    if (existingTags.length > 0) {
        await dbClient.featureTag.deleteMany({
            where: {
                tagId: {
                    in: existingTags.map(tag => tag.id),
                },
            },
        });

        await dbClient.scenarioTag.deleteMany({
            where: {
                tagId: {
                    in: existingTags.map(tag => tag.id),
                },
            },
        });

        // console.log(`Удалены старые связи с фичами и сценариями для тегов: ${existingTags.map(tag => tag.name).join(', ')}`);
    }

    await dbClient.$disconnect();
}
