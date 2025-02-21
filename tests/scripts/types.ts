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

export type TestData = Feature[];