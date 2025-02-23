import { TestData, ParsedFeature } from './types';
import { createId } from '@tests/shared/lib/id';

const collectFeatures = (testData: TestData, scenarioMap: Map<string, string>): ParsedFeature[] => {
    return testData.map(feature => ({
        id: createId(),
        name: feature.name,
        description: feature.description,
        uri: feature.uri,
        scenarioIds: feature.elements.map(scenario => scenarioMap.get(scenario.id) || ""),
    }));
};

export { collectFeatures };
