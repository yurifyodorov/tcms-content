export interface Step {
    id: string;
    name: string;
    media: string;
    keyword: string;
    scenarioIds: string[];
}

export interface ParsedStep {
    id: string;
    name: string;
    keyword: string;
    scenarioIds: string[];
    media?: string;
}

export interface ScenarioStep {
    scenarioId: string;
    stepId: string;
}

export interface Scenario {
    description: string;
    id: string;
    keyword: string;
    name: string;
    tags: Tag[];
    steps: Step[];
    type: string;
}

export interface ParsedScenario {
    id: string;
    featureId: string;
    keyword: string;
    name: string;
    tags?: { connect: { id: string }[] };
}

export interface Feature {
    description: string;
    elements: Scenario[];
    id: string;
    keyword: string;
    name: string;
    tags: Tag[];
}

export interface ParsedFeature {
    id: string;
    name: string;
    description: string;
    keyword: string;
    tags?: { connect: { id: string }[] };
    scenarios?: ParsedScenario[];
}


export interface Tag {
    id: string;
    name: string;
}

export interface FeatureTag {
    featureId: string;
    tagId: string;
}

export interface ScenarioTag {
    scenarioId: string;
    tagId: string;
}

export type TestData = Feature[];
