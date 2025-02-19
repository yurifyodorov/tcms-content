import { createId as generateId } from '@paralleldrive/cuid2';

export const createId = <T extends string = string>(): T => generateId() as T;
