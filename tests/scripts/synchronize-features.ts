import { dbClient } from '../shared/lib/db';
import { Feature } from './types';

export async function synchronizeFeatures(testData: Feature[]): Promise<void> {
    const featureNamesFromTestData = testData.map((feature: Feature) => feature.name.trim());

    const featuresInDb = await dbClient.feature.findMany();
    const featureMapFromDb = new Map<string, string>();
    featuresInDb.forEach((feature) => {
        const trimmedName = feature.name.trim();
        featureMapFromDb.set(trimmedName, feature.id);
    });

    const featuresToDelete = featuresInDb.filter(
        (feature) => !featureNamesFromTestData.includes(feature.name.trim())
    );

    if (featuresToDelete.length > 0) {
        await dbClient.feature.deleteMany({
            where: {
                id: {
                    in: featuresToDelete.map((feature) => feature.id),
                },
            },
        });

        console.log(`Удалены фичи: ${featuresToDelete.map((feature) => feature.name).join(', ')}`);
    }

    for (const feature of testData) {
        const trimmedFeatureName = feature.name.trim();
        const existingFeatureId = featureMapFromDb.get(trimmedFeatureName);

        if (existingFeatureId) {
            await dbClient.feature.update({
                where: { id: existingFeatureId },
                data: {
                    keyword: feature.keyword || 'Feature',
                    description: feature.description || '',
                },
            });
            console.log(`Обновлена фича: ${feature.name}`);
        } else {
            const newFeature = await dbClient.feature.create({
                data: {
                    name: feature.name,
                    keyword: feature.keyword || 'Feature',
                    description: feature.description || '',
                },
            });
            console.log(`Добавлена новая фича: ${feature.name}`);

            featureMapFromDb.set(newFeature.name.trim(), newFeature.id);
        }
    }

    console.log(`Всего фич в базе данных после синхронизации: ${featureMapFromDb.size}`);
}
