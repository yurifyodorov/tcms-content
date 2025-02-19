import { execSync } from 'child_process';
import { createId } from '../shared/lib/id';
import { saveResults } from './save-results';
import * as fs from 'fs';

function runTests(browser: string, runId: string): void {
    const specPaths: string[] = [
        'tests/e2e/features/**'
    ];

    console.log(`Running tests in ${browser} with runId: ${runId}...`);

    const specString = specPaths.join(',');

    try {
        execSync(`cypress run --browser ${browser} --spec '${specString}' --env browserName=${browser},runId=${runId} --no-runner-ui`, { stdio: 'inherit' });
        console.log(`Tests have been executed successfully in ${browser}`);
    } catch (error: any) {
        console.error(`Error during test execution in ${browser}:`, error.message);
        console.error('Continuing to save results and send reports despite the error.');
    }

    try {
        saveResults(runId, browser);
        console.log('Results saved successfully.');
    } catch (error: any) {
        console.error(`Error while saving results for runId ${runId}:`, error.message);
    }

    // try {
    //     execSync(`node tests/scripts/send-report.js ${browser} ${runId}`, { stdio: 'inherit' });
    //     console.log('Report sent successfully.');
    // } catch (error: any) {
    //     console.error(`Error while sending report for runId ${runId}:`, error.message);
    // }

    try {
        const tempDir = './temp';
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log(`Temporary directory "${tempDir}" has been deleted.`);
        }
    } catch (error: any) {
        console.error(`Error while cleaning up temp directory:`, error.message);
    }
}

const browser = process.argv[2];

if (!browser) {
    console.error('Please specify a browser as the first argument (e.g., "chrome", "edge", "firefox").');
    process.exit(1);
}

const runId = createId();

runTests(browser, runId);