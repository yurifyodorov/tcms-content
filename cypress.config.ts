import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import {
  addCucumberPreprocessorPlugin,
  afterRunHandler,
  beforeRunHandler
} from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import { specPaths } from "@tests/specs";
import { createId } from "@/tests/shared/lib/id";
import tcms from "@yurifyodorov/tcms-data-sync";

async function setupNodeEvents(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config, {
    omitBeforeRunHandler: true,
    omitAfterRunHandler: true,
    omitAfterScreenshotHandler: true,
  });

  on("before:run", async () => {
    await beforeRunHandler(config)
  });

  on("after:run", async () => {
    await afterRunHandler(config);


    const runId = createId();
    const browser = process.env.CYPRESS_BROWSER || 'unknown';
    const platform = process.platform;
    const databaseUrl = process.env.DATABASE_URL;
    const environment = process.env.ENVIRONMENT || "localhost"

    const reportPath = path.join(__dirname, "tests/reports/cucumber-report.json");

    if (fs.existsSync(reportPath)) {
      const rawTestData = fs.readFileSync(reportPath, "utf8");
      const testData = JSON.parse(rawTestData);

      if (databaseUrl) {
        await tcms.saveResults(runId, browser, platform, environment, databaseUrl, testData);
      }
    }
  });

  on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }));

  return config;
}

export default defineConfig({
  e2e: {
    baseUrl: process.env.TEST_ENV_BASE_URL,
    specPattern: specPaths,
    setupNodeEvents,
    downloadsFolder: "downloaded-files",
    screenshotOnRunFailure: false,
    video: true,
    videoCompression: 32,
    videosFolder: "tests/reports/videos",
    screenshotsFolder: "tests/reports/screenshots",
    supportFile: "tests/support/e2e.ts",
    env: {
      grepFilterSpecs: true,
      omitFiltered: false,
      filterSpecs: true,
    },
  },
  retries: {
    runMode: 0,
    openMode: 0,
  },
});