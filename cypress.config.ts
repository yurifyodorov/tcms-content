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
    baseUrl: process.env.TEST_ENV_BASE_URL || "http://localhost:3000",
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

      try {
        runner.runTests(runId, specPaths, browser, platform);
      } catch (error) {
        console.error("❌ Ошибка в runTests:", error);
      }


      on("after:run", async () => {
        console.log("📦 Сохранение результатов тестов...");
        try {
          await runner.saveBrowserDetails();
          await runner.saveSystemInfo();
          await runner.saveResults();
          await runner.sendSlackReport();
          console.log("✅ Все данные успешно сохранены!");
        } catch (error) {
          console.error("❌ Ошибка при сохранении результатов:", error);
        }
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
