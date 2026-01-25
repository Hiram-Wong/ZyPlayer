export type DeepMutable<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer R)[]
    ? DeepMutable<R>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      : T;

export type WidenLiteral<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

export type DeepWidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer R)[]
        ? DeepWidenLiteral<R>[]
        : T extends object
          ? { [K in keyof T]: DeepWidenLiteral<T[K]> }
          : T;

export type Normalize<T> = DeepMutable<DeepWidenLiteral<T>>;
