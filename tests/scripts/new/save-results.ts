import { TestData } from './types';
import { PrismaClient } from '@prisma/client';
import { createId } from '@tests/shared/lib/id';

import { collectFeatures } from "@tests/scripts/new/collect-features";
import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';

let dbClient: PrismaClient;

// Функция инициализации клиента базы данных
const initDbClient = (databaseUrl: string) => {
    console.log("Инициализация Prisma с URL:", databaseUrl);
    dbClient = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
};

// Основная функция сохранения результатов
const saveResults = async (
    runId: string,
    browser: string,
    platform: string,
    databaseUrl: string,
    testData: TestData
): Promise<void> => {
    console.log(`runId: ${runId}`);
    console.log(`browser: ${browser}`);
    console.log(`platform: ${platform}`);
    console.log(`databaseUrl: ${databaseUrl}`);

    // Инициализация клиента с переданным URL
    initDbClient(databaseUrl);

    const scenarios = collectScenarios(testData);
    console.log("Scenarios to be saved:", JSON.stringify(scenarios, null, 2));

    const scenarioMap = new Map<string, string>();
    testData.forEach((feature, featureIndex) => {
        feature.elements.forEach((scenario, scenarioIndex) => {
            scenarioMap.set(scenario.id, scenarios[featureIndex * feature.elements.length + scenarioIndex].id);
        });
    });

    const features = collectFeatures(testData, scenarioMap);
    console.log("Features to be saved:", JSON.stringify(features, null, 2));

    const steps = collectSteps(scenarios);
    console.log("Steps to be saved:", JSON.stringify(steps, null, 2));

    try {
        // Подключение к базе данных
        console.log("Подключаемся к базе данных...");
        await dbClient.$connect();
        console.log("Подключение к базе данных установлено!");

        // Сохранение фич
        const featureMap = new Map<string, string>(); // name -> id
        for (const feature of features) {
            try {
                const savedFeature = await dbClient.feature.upsert({
                    where: { name: feature.name },
                    update: {},
                    create: {
                        id: createId(),
                        name: feature.name
                    }
                });
                console.log(`Feature saved: ${feature.name} with id: ${savedFeature.id}`);

                featureMap.set(feature.name, savedFeature.id);

                await dbClient.runFeature.create({
                    data: {
                        runId,
                        featureId: savedFeature.id
                    }
                });

                console.log(`Feature linked to run successfully: ${feature.name}`);
            } catch (error) {
                console.error(`Ошибка при сохранении фичи ${feature.name}:`, error);
            }
        }

        // Сохранение сценариев
        const scenarioMap = new Map<string, string>(); // name -> id
        for (const scenario of scenarios) {
            try {
                const savedScenario = await dbClient.scenario.upsert({
                    where: { name: scenario.name },
                    update: { status: scenario.status },
                    create: {
                        id: scenario.id,
                        name: scenario.name,
                        status: scenario.status
                    }
                });
                console.log(`Scenario saved: ${scenario.name} with id: ${savedScenario.id}`);

                scenarioMap.set(scenario.name, savedScenario.id);

                await dbClient.runScenario.create({
                    data: {
                        runId,
                        scenarioId: savedScenario.id
                    }
                });

                console.log(`Scenario linked to run successfully: ${scenario.name}`);
            } catch (error) {
                console.error(`Ошибка при сохранении сценария ${scenario.name}:`, error);
            }
        }

        // Привязка сценариев к фичам (ScenarioFeature)
        for (const feature of testData) {
            for (const scenario of feature.elements) {
                try {
                    const scenarioId = scenarioMap.get(scenario.name);
                    const featureId = featureMap.get(feature.name);
                    if (scenarioId && featureId) {
                        await dbClient.scenarioFeature.upsert({
                            where: { scenarioId_featureId: { scenarioId, featureId } },
                            update: {},
                            create: { scenarioId, featureId }
                        });
                        console.log(`ScenarioFeature linked: ${scenario.name} -> ${feature.name}`);
                    }
                } catch (error) {
                    console.error(`Ошибка при привязке сценария к фиче ${feature.name} и сценарию ${scenario.name}:`, error);
                }
            }
        }

        // Сохранение шагов
        for (const step of steps) {
            try {
                await dbClient.step.upsert({
                    where: { name: step.name },
                    update: { status: step.status },
                    create: {
                        id: step.id,
                        name: step.name,
                        status: step.status
                    }
                });
                console.log(`Step saved: ${step.name}`);

                await dbClient.runStep.create({
                    data: {
                        runId,
                        stepId: step.id
                    }
                });
                console.log(`Step linked to run successfully: ${step.name}`);
            } catch (error) {
                console.error(`Ошибка при сохранении шага ${step.name}:`, error);
            }
        }

        // Привязка шагов к сценариям (ScenarioStep)
        for (const scenario of scenarios) {
            for (const stepId of scenario.stepsIds) {
                try {
                    await dbClient.scenarioStep.upsert({
                        where: { scenarioId_stepId: { scenarioId: scenario.id, stepId } },
                        update: {},
                        create: {
                            scenarioId: scenario.id,
                            stepId
                        }
                    });
                    console.log(`ScenarioStep linked: ${scenario.id} -> ${stepId}`);
                } catch (error) {
                    console.error(`Ошибка при привязке шага к сценарию ${scenario.id} и шагу ${stepId}:`, error);
                }
            }
        }

        console.log("✅ Данные успешно сохранены в базу!");
    } catch (error) {
        console.error("❌ Ошибка при сохранении в базу:", error);
    } finally {
        await dbClient.$disconnect();
        console.log("Отключение от базы данных выполнено.");
    }
};

export { saveResults };
