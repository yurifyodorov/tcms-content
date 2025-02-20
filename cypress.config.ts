import * as process from "process";
require("dotenv").config();
import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import tcms from "@yurifyodorov/tcms-data-sync";
import { specPaths } from "@/tests/specs";
import { createId } from "@/tests/shared/lib/id";
import * as fs from "fs";

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

      on("after:run", () => {

        const testData = JSON.parse(fs.readFileSync("tests/reports/cucumber-report.json", "utf8"));
        // TODO: удалить сначала все "embeddings" перед передачей в saveResults

        tcms.saveResults(runId, browser, platform, testData);

        // Отправка отчета в Slack
        tcms.sendSlackReport();
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
