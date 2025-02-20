import * as process from "process";
require("dotenv").config();
import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import runner from "@yurifyodorov/tcms-test-runner";
import { specPaths } from "@/tests/specs";
import { createId } from "@/tests/shared/lib/id";

const runId = createId();
const browser = process.env.BROWSER || "chrome";
const platform = process.platform;

export default defineConfig({
  e2e: {
    baseUrl: process.env.TEST_ENV_BASE_URL,
    specPattern: specPaths,
    supportFile: "tests/support/e2e.ts",

    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
          "file:preprocessor",
          createBundler({
            plugins: [createEsbuildPlugin(config)],
          })
      );

      config.env = config.env || {};
      config.env.resetRunState = true;

      runner.runTests(runId, specPaths, browser, platform);

      on("after:run", async () => {
        await runner.saveResults();
        await runner.sendSlackReport();
      });

      return config;
    },

    screenshotOnRunFailure: false,
    screenshotsFolder: "tests/reports/screenshots",
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
