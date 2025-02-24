import { dbClient } from '../shared/lib/db';
import { createId } from '../shared/lib/id';
import { TestData, FeatureTag, ScenarioTag } from "@tests/scripts/types";
import { collectFeatures } from "./collect-features";
import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';
import { collectTags } from "./collect-tags";

export async function saveResults(
    runId: string,
    browser: string,
    platform: string,
    environment: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> {

    console.log(`runId: ${runId}`);
    console.log(`browser: ${browser}`);
    console.log(`platform: ${platform}`);
    console.log(`environment: ${environment}`);
    console.log(`databaseUrl: ${databaseUrl}`);

    const scenarios = collectScenarios(testData);
    console.log("Scenarios to be saved:", JSON.stringify(scenarios, null, 2));

    const scenarioMap = new Map<string, string>();
    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            scenarioMap.set(scenario.id, scenarios[featureIndex * feature.elements.length + scenarioIndex].id);
        });
    });

    const features = collectFeatures(testData);
    console.log("Features to be saved:", JSON.stringify(features, null, 2));

    const steps = collectSteps(testData);
    console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    let featuresCount = 0;
    let scenariosCount = 0;
    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let stepsCount = 0;

    let featuresToCreate = [];
    let scenariosToCreate = [];
    let stepsToCreate = [];

    let status = 'completed';

    let runDuration = 0;

    const featureTagsToCreate: FeatureTag[] = [];
    const scenarioTagsToCreate: ScenarioTag[] = [];

    const tagsSet = new Set<string>();

    // Получаем все теги из базы данных
    const tagsInDb = await dbClient.tag.findMany();
    const tagMap = new Map<string, string>();
    tagsInDb.forEach(tag => {
        tagMap.set(tag.name, tag.id);
    });

    for (const feature of testData) {
        featuresCount++;

        const featureId = createId();

        const tags = (feature.tags || []).map((tag: { name: string }) => tag.name);

        // Сначала сохраняем Feature без поля tags
        const featureData = {
            id: featureId,
            keyword: feature.keyword,
            name: feature.name,
            description: feature.description || '',
        };

        featuresToCreate.push(featureData);

        // Добавляем теги в Set и связываем их с Feature
        tags.forEach((tagName: string) => {
            tagsSet.add(tagName);
            const tagId = tagMap.get(tagName);
            if (tagId) {
                featureTagsToCreate.push({
                    featureId: featureId,
                    tagId: tagId, // Используем ID тега
                });
            } else {
                console.warn(`Tag with name ${tagName} not found in database.`);
            }
        });

        // Дальше обработка сценариев с аналогичными изменениями
        for (const scenario of feature.elements) {
            const scenarioId = createId();

            const scenarioTags = (scenario.tags || []).map((tag: { name: string }) => tag.name);
            // Добавляем теги сценариев в Set
            scenarioTags.forEach((tagName: string) => {
                tagsSet.add(tagName);
                const tagId = tagMap.get(tagName);
                if (tagId) {
                    scenarioTagsToCreate.push({
                        scenarioId: scenarioId,
                        tagId: tagId, // Используем ID тега
                    });
                } else {
                    console.warn(`Tag with name ${tagName} not found in database.`);
                }
            });

            const scenarioData = {
                id: scenarioId,
                featureId: featureId,
                keyword: feature.keyword,
                name: scenario.name,
            };

            scenariosToCreate.push(scenarioData);

            for (const step of scenario.steps) {
                const stepData = {
                    id: createId(),
                    scenarioId: scenarioId,
                    keyword: step.keyword,
                    name: step.name,
                    media: step.media
                };

                stepsToCreate.push(stepData);
                stepsCount++;
            }

            scenariosCount++;
        }
    }

    if (failCount > 0) {
        status = 'failed';
    }

    // Создаем все теги в базе данных, если их еще нет
    const tagsToCreate = Array.from(tagsSet).map(tagName => ({
        name: tagName,
    }));

    // Используем createMany, чтобы добавить все уникальные теги
    await dbClient.tag.createMany({
        data: tagsToCreate,
        skipDuplicates: true, // Пропускаем дубли
    });

    await dbClient.run.create({
        data: {
            id: runId,
            status: status,
            browser: browser,
            platform: platform,
            featuresCount,
            scenariosCount,
            passCount,
            failCount,
            skipCount,
            stepsCount,
            auto: true,
            duration: runDuration,
        }
    });

    // Теперь можно безопасно добавить связи между тегами и фичами/сценариями
    await dbClient.$transaction([
        dbClient.feature.createMany({ data: featuresToCreate }),
        dbClient.scenario.createMany({ data: scenariosToCreate }),
        dbClient.step.createMany({ data: stepsToCreate }),
        dbClient.featureTag.createMany({ data: featureTagsToCreate }),
        dbClient.scenarioTag.createMany({ data: scenarioTagsToCreate }),
        dbClient.run.update({
            where: { id: runId },
            data: {
                featuresCount,
                scenariosCount,
                passCount,
                failCount,
                skipCount,
                stepsCount,
                duration: runDuration,
            }
        }),
    ]);
}
