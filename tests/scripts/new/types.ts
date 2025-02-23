export interface Step {
    arguments: any[];
    keyword: string;
    line: number;
    name: string;
    match: {
        location: string;
    };
    result: {
        status: 'passed' | 'failed' | 'skipped';
        duration: number;
        error_message?: string;
    };
}

export interface ParsedStep {
    id: string;
    name: string;
    keyword: string;
    scenarioIds: string[];
    status: 'passed' | 'failed' | 'skipped';
}

export interface Scenario {
    description: string;
    id: string;
    keyword: string;
    line: number;
    name: string;
    steps: Step[];
    tags: string[];
    type: 'scenario';
}

export interface ParsedScenario {
    id: string;
    name: string;
    featureIds: string[];
    stepsIds: string[];
    status: 'passed' | 'failed' | 'skipped';
}


export interface Feature {
    description: string;
    elements: Scenario[];
    id: string;
    line: number;
    keyword: string;
    name: string;
    tags: string[];
    uri: string;
}

export interface ParsedFeature {
    id: string;
    description: string;
    name: string;
    uri: string;
    scenarioIds: string[];
}

export type TestData = Feature[];
