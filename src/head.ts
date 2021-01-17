export type Head<T> = null | undefined | [] | [T] | T[] | T;
export type UnHead<T, OR = undefined> = T extends null | undefined ? OR :
  T extends [infer R, ...unknown[]] ? R : 
  T extends readonly [infer R, ...unknown[]] ? R : 
  T extends [] ? OR : 
  T extends [infer R] ? R : 
  T extends Array<infer R> ? R | OR : T;

export const head = <T>(t: T): UnHead<T> => {
  if (Array.isArray(t)) {
    return t[0];
  } else if (t === undefined || t === null) {
    return undefined as UnHead<T>;
  }
  return t as UnHead<T>;
};
