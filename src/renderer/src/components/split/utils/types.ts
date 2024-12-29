import type { App, RenderFunction } from 'vue';
import { VNode } from 'vue';

export interface ArcoOptions {
  classPrefix?: string;
  componentPrefix?: string;
}

export interface ArcoIconOptions {
  iconPrefix?: string;
}

export interface ArcoGlobalConfig {
  classPrefix?: string;
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type BaseType = string | number;
export type UnionType = BaseType | Record<string, any>;
export type Data = Record<string, any>;
export type RenderContent = string | RenderFunction;

export type EmitFn<T> = (event: T, ...args: any[]) => void;

export type EmitFn2<
  Options = Record<string, any>,
  Event extends keyof Options = keyof Options
> = UnionToIntersection<
  {
    [key in Event]: Options[key] extends (...args: infer Args) => any
      ? (event: key, ...args: Args) => void
      : (event: key, ...args: any[]) => void;
  }[Event]
>;

export type EmitType<T> = T | T[];

export type SFCWithInstall<T, D = Record<string, never>> = T &
  D & {
    install: (app: App, opt?: ArcoOptions) => void;
  };

export type ClassName =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[];

export type FieldString<T> = {
  [K in keyof T]?: string;
};

export interface SlotChildren {
  value?: VNode[];
}

export interface ValueData {
  value: string | number;
  label: string;
  closable?: boolean;

  [other: string]: any;
}

export type AnimationDuration =
  | number
  | {
      enter: number;
      leave: number;
    };
