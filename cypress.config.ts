import * as process from "process";
require('dotenv').config();
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import {
  addCucumberPreprocessorPlugin,
  beforeRunHandler,
  afterRunHandler,
} from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import * as fs from 'fs';
import * as path from 'path';
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
    await beforeRunHandler(config);
  });

  on("after:run", async () => {
    await afterRunHandler(config);
  });

  on(
      "file:preprocessor",
      createBundler({
        plugins: [createEsbuildPlugin(config)],
      })
  );

  return config;
}

const runId = createId();
const browser = process.env.BROWSER || "chrome";
const platform = process.platform;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Не найден DATABASE_URL в переменных окружения");
}

try {
  const reportPath = path.join(__dirname, "tests/reports/cucumber-report.json");

  if (fs.existsSync(reportPath)) {
    const rawTestData = fs.readFileSync(reportPath, "utf8");
    const testData = JSON.parse(rawTestData);

    if (databaseUrl) {
      tcms.saveResults(runId, browser, platform, testData, databaseUrl);
    }

    tcms.sendSlackReport();
  } else {
    console.error(`Файл ${reportPath} не найден`);
  }
} catch (error) {
  console.error("Ошибка при чтении или обработке файла:", error);
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
  defaultCommandTimeout: 4000,
  requestTimeout: 4000,
  retries: {
    runMode: 0,
    openMode: 0,
  },
});
