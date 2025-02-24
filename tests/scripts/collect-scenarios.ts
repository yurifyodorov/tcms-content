import { TestData, ParsedScenario } from './types';
import { createId } from '@tests/shared/lib/id';

const collectScenarios = (testData: TestData): ParsedScenario[] => {
    const scenarios: ParsedScenario[] = [];

    testData.forEach(feature => {
        feature.elements.forEach(scenario => {
            scenarios.push({
                id: createId(),
                featureId: feature.id,
                keyword: feature.keyword,
                name: scenario.name,
                tags: {
                    connect: scenario.tags ? scenario.tags.map(tag => ({ id: tag.id })) : []
                }
            });
        });
    });

    return scenarios;
};

export { collectScenarios };
