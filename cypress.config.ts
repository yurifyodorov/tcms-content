import * as process from "process";
require('dotenv').config();
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import runner from "@yurifyodorov/tcms-test-runner";

import { specPaths } from "@/tests/specs";

import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: process.env.TEST_ENV_BASE_URL,
    specPattern: specPaths,
    supportFile: 'tests/support/e2e.ts',
    async setupNodeEvents(on, config) {
      if (process.env.npm_config_browser) {
        config.env.browser = process.env.npm_config_browser;
      }

      await addCucumberPreprocessorPlugin(on, config);

      on(
          'file:preprocessor',
          createBundler({
            plugins: [createEsbuildPlugin(config)],
          })
      );

      on('after:run', async () => {
        const browser = config.env.browser;

        if (!browser) {
          console.error('Ошибка: Не указан браузер в конфигурации (config.env.browser).');
          process.exit(1);
        }

        await runner.runTests(specPaths, browser);
        runner.saveBrowserDetails();
        runner.saveSystemInfo();
        runner.saveResults();
        runner.sendSlackReport();
      });

      return config;
    },
    screenshotOnRunFailure: false,
    screenshotsFolder: 'tests/reports/screenshots',
    video: false,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      grepFilterSpecs: true,
      omitFiltered: true,
      filterSpecs: true,
    },
  },
  retries: {
    runMode: 0,
    openMode: 0
  },
});
