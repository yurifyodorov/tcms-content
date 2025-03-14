import { getDbClient } from '../shared/lib/db';
import { TestData } from './types';
import { collectTags } from "./collect-tags";

export async function synchronizeTags(testData: TestData, databaseUrl: string): Promise<void> {
    const dbClient = getDbClient(databaseUrl);

    if (!dbClient) {
        throw new Error('dbClient is not initialized.');
    }

    const tagsFromTests = collectTags(testData);
    const tagsSetFromTests = new Set<string>(tagsFromTests.map(tag => tag.name.trim()));

    // console.log("Теги, собранные из тестов:", tagsSetFromTests);

    const tagsInDb = await dbClient.tag.findMany();
    const tagMapFromDb = new Map<string, string>();
    tagsInDb.forEach(tag => {
        tagMapFromDb.set(tag.name.trim(), tag.id);
    });

    // console.log("Теги, найденные в БД:", tagMapFromDb);

    // Найти теги, которых больше нет в тестах, но они есть в БД
    const tagsToDelete = tagsInDb.filter(tag => !tagsSetFromTests.has(tag.name.trim()));

    if (tagsToDelete.length > 0) {
        // console.log("Удаляем устаревшие теги:", tagsToDelete.map(tag => tag.name));

        await dbClient.featureTag.deleteMany({
            where: { tagId: { in: tagsToDelete.map(tag => tag.id) } },
        });

        await dbClient.scenarioTag.deleteMany({
            where: { tagId: { in: tagsToDelete.map(tag => tag.id) } },
        });

        await dbClient.tag.deleteMany({
            where: { id: { in: tagsToDelete.map(tag => tag.id) } },
        });

        // console.log("Удалены теги:", tagsToDelete.map(tag => tag.name));
    }

    // Найти новые теги, которых нет в БД
    const newTagsToAdd = Array.from(tagsSetFromTests)
        .filter(tagName => !tagMapFromDb.has(tagName))
        .map(tagName => ({ name: tagName }));

    if (newTagsToAdd.length > 0) {
        // console.log("Добавляем новые теги:", newTagsToAdd);

        await dbClient.tag.createMany({
            data: newTagsToAdd,
            skipDuplicates: true,
        });

        // console.log("Новые теги успешно добавлены");
    }

    // Заново загружаем теги, чтобы получить их ID
    const updatedTagsInDb = await dbClient.tag.findMany();
    const updatedTagMap = new Map<string, string>();
    updatedTagsInDb.forEach(tag => {
        updatedTagMap.set(tag.name.trim(), tag.id);
    });

    // console.log("Обновленный список тегов из БД:", updatedTagMap);

    // Очистка связей для существующих тегов
    const existingTags = updatedTagsInDb.filter(tag => tagsSetFromTests.has(tag.name.trim()));

    if (existingTags.length > 0) {
        // console.log("Удаляем старые связи для тегов:", existingTags.map(tag => tag.name));

        await dbClient.featureTag.deleteMany({
            where: { tagId: { in: existingTags.map(tag => tag.id) } },
        });

        await dbClient.scenarioTag.deleteMany({
            where: { tagId: { in: existingTags.map(tag => tag.id) } },
        });

        // console.log("Связи с тегами удалены");
    }

    await dbClient.$disconnect();
}
