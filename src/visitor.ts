import { head, Head, UnHead } from "./head";

type AnyFun = ((...args: never[]) => unknown);
type FunSelector<C, I extends string, K = keyof C, Y = undefined> = 
K extends keyof C 
    ? C[K] extends (s: infer R) => unknown 
        ? Y extends string 
            ? { [P in I]: K } & { [P in Y]: R}
            : R extends { [P in I]: K } 
                ? R
                : never 
        : never
    : never

type FunSelectorD<C, I extends string, D extends string | number | symbol, Y> = (D extends keyof C ? C[D] extends (s: infer R) => unknown ? R : never : never) |
    FunSelector<C, I, keyof C, Y>

type ReturnType<T extends AnyFun> = T extends (...args: never[]) => infer R ? R : never;
type Parameters<T extends AnyFun> = T extends (...args: infer P) => unknown ? P : never;
type Tail<Arr> = (Arr extends Array<unknown> ? (...a: Arr) => unknown : never) extends (a1: never, ...args: infer P) => unknown ? P : never;
type Arr<A> = A extends [never] ? [A] : A;

type Val<C, K, F = undefined> = C extends unknown ? (K extends keyof C ? C[K] : F) : F;
type Fun<F, X = MockFun> = F extends AnyFun ? F : X
type BySelector<C, T, I, D> = T extends undefined ? MockFun : 
    Fun<Val<C, Val<T, I>, Val<C, D>>>

type MockFun = (...args: never[]) => undefined

export class Visitor<C, D extends string, I extends string, Y extends string | undefined> {
    constructor(private handlers: C, private defaultHandler: D, private id: I, private prop?: Y) { }

    one<T extends Head<FunSelectorD<C, I, D,Y>>>(
        selector: T,
        ...params: Arr<Tail<Parameters<BySelector<C, UnHead<T>, I, D>>>>
    ): ReturnType<BySelector<C, UnHead<T>, I, D>>;

    one<T extends Head<FunSelectorD<C, string, string, Y>>>(selector: T, ...params: unknown[]): unknown {
        const justSelector = head(selector);
        if (justSelector === undefined) {
            return undefined;
        }
        const selectorType = justSelector[this.id as unknown as keyof typeof justSelector] as string;
        const funName = (selectorType in this.handlers ? selectorType : this.defaultHandler) as keyof C;
        const fun = this.handlers[funName] as unknown as ((...args: unknown[]) => unknown);
        const val = this.prop !== undefined ? justSelector[this.prop as unknown as keyof typeof justSelector] : justSelector;
        return fun(val, ...params);
    }

    all<T extends FunSelectorD<C, I, D, Y>>(
        selector: T[],
        ...params: Arr<Tail<Parameters<BySelector<C, T, I, D>>>>
    ): ReturnType<BySelector<C, T, I, D>>[];

    all(selector: Array<unknown>, ...params: unknown[]): unknown {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector.map(el => this.one(el as any, ...params as any));
    }
}

type Names<T> = T extends { name: infer R } ? R extends string ? R : never : never;
type SelectorByName<N, S> = S extends { name: infer R } ? R extends N ? S : never : never;
export type Handlers<T> = {
    [P in Names<T>]: (selector:  SelectorByName<P, T>, ...args: unknown[]) => unknown
}
export type DefaultHandler<T, D extends string = "default"> = {
    [P in D]: (selector: T, ...args: unknown[]) => unknown
}
