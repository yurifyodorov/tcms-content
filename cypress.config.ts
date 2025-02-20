import * as process from "process";
require('dotenv').config();
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import runner from "@yurifyodorov/tcms-test-runner";

// @ts-ignore
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: process.env.TEST_ENV_BASE_URL,
    specPattern: '**/*.feature',
    supportFile: 'tests/support/e2e.ts',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
          'file:preprocessor',
          createBundler({
            plugins: [createEsbuildPlugin(config)],
          })
      );

      on('after:run', async () => {
        runner.runTests();
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
