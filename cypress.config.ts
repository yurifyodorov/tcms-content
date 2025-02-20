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
        const filePath = "tests/reports/cucumber-report.json";

        console.log("Путь к файлу:", filePath);

        try {
          const rawTestData = fs.readFileSync(filePath, "utf8");
          const testData = JSON.parse(rawTestData);


          console.log("Полученные данные теста:", testData);

          const databaseUrl = process.env.DATABASE_URL;

          if (databaseUrl) {
            tcms.saveResults(runId, browser, platform, testData, databaseUrl);
          } else {
            console.error("Не найден DATABASE_URL в переменных окружения");
          }

          // Отправка отчета в Slack
          tcms.sendSlackReport();
        } catch (error) {
          // Логируем ошибку, если возникнет
          console.error("Ошибка при чтении или обработке файла:", error);
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
