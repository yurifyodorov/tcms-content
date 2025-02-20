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
      const browser = process.argv.includes('--browser')
          ? process.argv[process.argv.indexOf('--browser') + 1] : undefined;

      console.log('Configured browser:', browser);

      if (browser) {
        config.env.browser = browser;
      } else {
        console.error('Browser not specified!');
      }

      await addCucumberPreprocessorPlugin(on, config);
      on(
          'file:preprocessor',
          createBundler({
            plugins: [createEsbuildPlugin(config)],
          })
      );

      on('after:run', async () => {
        const browserFromEnv = config.env.browser;
        if (browserFromEnv) {
          await runner.runTests(specPaths, browserFromEnv);
          runner.saveBrowserDetails();
          runner.saveSystemInfo();
          runner.saveResults();
          runner.sendSlackReport();
        } else {
          console.error('Browser not specified in config.env.browser');
        }
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
    openMode: 0,
  },
});
