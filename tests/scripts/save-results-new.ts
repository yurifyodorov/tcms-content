import { TestData } from './types';

const saveResults = (
    runId: string,
    browser: string,
    platform: string,
    databaseUrl: string,
    testData: TestData
): void => {

    console.log(`runId: ${runId}`);
    console.log(`browser: ${browser}`);
    console.log(`platform: ${platform}`);
    console.log(`databaseUrl: ${databaseUrl}`);
    console.log("testData:", JSON.stringify(testData, null, 2));


    console.log("✅ Функция saveResults выполнена успешно!");
};

export { saveResults };