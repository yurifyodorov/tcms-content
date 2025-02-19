/// <reference types="cypress" />

import * as fs from 'fs';
import * as path from 'path';
import { dbClient } from '../shared/lib/db';
import { createId } from '../shared/lib/id';

export async function saveResults(runId: string, browserName: string): Promise<void> {

    const currentEnv = process.env.ENVIRONMENT;
    console.log('Current Environment:', currentEnv);

    const reportFilePath = path.resolve('tests/reports/cucumber-report.json');

    if (!fs.existsSync(reportFilePath)) {
        return;
    }

    const reportData = JSON.parse(fs.readFileSync(reportFilePath, 'utf-8'));

    let browserInfo = null;
    const browserInfoFilePath = path.join(process.cwd(), 'temp', 'browsers', `${browserName}.json`);

    if (fs.existsSync(browserInfoFilePath)) {
        try {
            const rawBrowserData = fs.readFileSync(browserInfoFilePath, 'utf-8').trim();
            browserInfo = JSON.parse(rawBrowserData);
        } catch (error: unknown) {
            console.error('Error reading browser info from file:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    let systemInfo = null;
    const systemInfoFilePath = path.join(process.cwd(), 'temp', 'system.json');

    if (fs.existsSync(systemInfoFilePath)) {
        try {
            const rawSystemData = fs.readFileSync(systemInfoFilePath, 'utf-8').trim();
            systemInfo = JSON.parse(rawSystemData);
        } catch (error: unknown) {
            console.error('Error reading system info from file:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

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

    let environment: string | null = null;

    if (currentEnv) {
        environment = currentEnv;
    }

    let runDuration = 0;

    for (const feature of reportData) {
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

            for (const step of scenario.steps.filter((step: any) => !['Before', 'BeforeAll', 'After', 'AfterAll'].includes(step.keyword))) {
                const stepDuration = step.result.duration; // in nanoseconds
                const stepDurationInMs = Math.floor(stepDuration / 1000000); // Convert from nanoseconds to milliseconds
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
            environment: environment || '',
            status: status,
            featuresCount,
            scenariosCount,
            passCount,
            failCount,
            skipCount,
            stepsCount,
            auto: true,
            browser: browserInfo || null,
            system: systemInfo || null,
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