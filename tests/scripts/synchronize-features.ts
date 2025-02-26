import { dbClient } from '../shared/lib/db';
import { Feature } from './types';

export async function synchronizeFeatures(testData: Feature[]): Promise<void> {
    // Шаг 1: Извлекаем названия фич из тестовых данных и логи
    const featureNamesFromTestData = testData.map((feature: Feature) => feature.name.trim());
    console.log('Feature names from test data:', featureNamesFromTestData);

    // Шаг 2: Получаем все фичи из базы данных
    const featuresInDb = await dbClient.feature.findMany();
    console.log('Features in DB:', featuresInDb.map(f => f.name));

    // Создаем мапу фичей из базы данных для быстрого поиска
    const featureMapFromDb = new Map<string, string>();
    featuresInDb.forEach((feature) => {
        const trimmedName = feature.name.trim();
        featureMapFromDb.set(trimmedName, feature.id);
    });

    // Шаг 3: Определяем фичи, которые нужно удалить
    const featuresToDelete = featuresInDb.filter(
        (feature) => !featureNamesFromTestData.includes(feature.name.trim())
    );
    console.log('Features to delete:', featuresToDelete.map(f => f.name));

    // Удаляем ненужные фичи
    if (featuresToDelete.length > 0) {
        await dbClient.feature.deleteMany({
            where: {
                id: {
                    in: featuresToDelete.map((feature) => feature.id),
                },
            },
        });
        console.log(`Удалены фичи: ${featuresToDelete.map((feature) => feature.name).join(', ')}`);
    } else {
        console.log('Нет фич, которые нужно удалить.');
    }

    // Шаг 4: Синхронизируем фичи из тестовых данных
    for (const feature of testData) {
        const trimmedFeatureName = feature.name.trim();
        const existingFeatureId = featureMapFromDb.get(trimmedFeatureName);

        if (existingFeatureId) {
            // Обновляем существующую фичу
            await dbClient.feature.update({
                where: { id: existingFeatureId },
                data: {
                    keyword: feature.keyword || 'Feature',
                    description: feature.description || '',
                },
            });
            console.log(`Обновлена фича: ${feature.name}`);
        } else {
            // Добавляем новую фичу
            const newFeature = await dbClient.feature.create({
                data: {
                    name: feature.name,
                    keyword: feature.keyword || 'Feature',
                    description: feature.description || '',
                },
            });
            console.log(`Добавлена новая фича: ${feature.name}`);

            // Добавляем в мапу для последующего обновления
            featureMapFromDb.set(newFeature.name.trim(), newFeature.id);
        }
    }

    // Шаг 5: Логируем итоговое количество фич в базе
    console.log(`Всего фич в базе данных после синхронизации: ${featureMapFromDb.size}`);
}
