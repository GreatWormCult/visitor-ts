import test, { ExecutionContext } from 'ava';

import { head, UnHead } from './head';

const macro = <T>(t: ExecutionContext, input: T, expected: UnHead<T>) => {
  t.is(head(input), expected);
};

macro['title'] = (title = 'head of', input: unknown, expected: unknown) =>
  `${title} ${JSON.stringify(input)} = ${JSON.stringify(expected)}`;

test(macro, 'B' as const, 'B' as const);
test(macro, null, undefined);
test(macro, ['B', 'T'] as const, 'B' as const);
