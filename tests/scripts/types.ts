export interface Step {
    keyword: string;
    line: number;
    name: string;
    media: string;
}

export interface ParsedStep {
    id: string;
    name: string;
    keyword: string;
}


export interface Scenario {
    description: string;
    id: string;
    keyword: string;
    name: string;
    tags: { name: string }[];
}

export interface ParsedScenario {
    id: string;
    name: string;
    tags: { name: string }[];
}

export interface Feature {
    description: string;
    elements: Scenario[];
    id: string;
    keyword: string;
    name: string;
    tags: { name: string }[];
}

export interface ParsedFeature {
    id: string;
    name: string;
    description: string;
}

export type TestData = Feature[];