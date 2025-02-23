/// <reference types="cypress" />

import * as fs from 'fs';
import * as path from 'path';
import { dbClient } from '../shared/lib/db';
import { createId } from '../shared/lib/id';
import { TestData } from "@tests/scripts/types";

import { collectFeatures } from "./collect-features";
import { collectScenarios } from './collect-scenarios';
import { collectSteps } from './collect-steps';

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

    const features = collectFeatures(testData, scenarioMap);
    console.log("Features to be saved:", JSON.stringify(features, null, 2));

    const steps = collectSteps(scenarios);
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

    for (const feature of testData) {
        let featureDuration = 0;
        featuresCount++;

        const featureId = createId();
        const featureData = {
            id: featureId,
            name: feature.name,
            description: feature.description || '',
            uri: feature.uri,
            runId: runId,
            duration: featureDuration,
        };

        featuresToCreate.push(featureData);

        for (const scenario of feature.elements) {
            let scenarioDuration = 0;
            let scenarioStatus = 'passed';
            const scenarioId = createId();

            const tags = (scenario.tags || []).map((tag: { name: string }) => tag.name);

            const scenarioData = {
                id: scenarioId,
                runId: runId,
                featureId: featureId,
                name: scenario.name,
                line: scenario.line,
                status: scenarioStatus,
                message: '', // TODO: что сохранять?
                tags: tags,
                duration: scenarioDuration,
            };

            scenariosToCreate.push(scenarioData);

            let scenarioFailed = false;
            let scenarioSkipped = true;

            for (const step of scenario.steps) {
                const stepDuration = step.result.duration;
                const stepDurationInMs = Math.floor(stepDuration / 1000000);
                scenarioDuration += stepDurationInMs;

                const stepData = {
                    id: createId(),
                    runId: runId,
                    scenarioId: scenarioId,
                    name: `${step.keyword.trim()} ${step.name}`,
                    status: step.result.status,
                    duration: stepDurationInMs,
                    message: step.result.error_message || '',
                };

                stepsToCreate.push(stepData);
                stepsCount++;

                if (step.result.status === 'failed') {
                    scenarioFailed = true;
                }

                if (step.result.status !== 'skipped') {
                    scenarioSkipped = false;
                }
            }

            if (scenarioSkipped) {
                scenarioStatus = 'skipped';
                skipCount++;
            } else if (scenarioFailed) {
                scenarioStatus = 'failed';
                failCount++;
            } else {
                scenarioStatus = 'passed';
                passCount++;
            }

            scenariosCount++;
            scenarioData.status = scenarioStatus;
            scenarioData.duration = scenarioDuration;
        }

        featureDuration += scenariosToCreate.reduce((acc, scenario) => acc + scenario.duration, 0);
        featureData.duration = featureDuration;

        runDuration += featureDuration;
    }

    if (failCount > 0) {
        status = 'failed';
    }

    await dbClient.run.create({
        data: {
            id: runId,
            status: status,
            browser: 'test',
            platform: 'test',
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

    await dbClient.$transaction([
        dbClient.feature.createMany({ data: featuresToCreate }),
        dbClient.scenario.createMany({ data: scenariosToCreate }),
        dbClient.step.createMany({ data: stepsToCreate }),
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