import type { ObjectOptions as TObjectOptions, TObject, TProperties, TSchema } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

/**
 * Create a schema with a string enumeration type
 */
export const StringEnum = <T extends string[]>(values: [...T]) =>
  Type.Unsafe<T[number]>({ type: 'string', enum: values });

/**
 * Create a schema with a number enumeration type
 */
export const NumberEnum = <T extends number[]>(values: [...T]) =>
  Type.Unsafe<T[number]>({ type: 'number', enum: values });

/**
 * Enumeration of response status codes
 */
export enum ResponseCode {
  SUCCESS = 0,
  ERROR = -1,
}

/**
 * Convert object properties to nullable
 */
export const Nullable = <T extends TObject>(schema: T) =>
  Type.Object(
    Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [k, Type.Union([v, Type.Null()])]),
    ) as TProperties,
    { ...schema, properties: undefined },
  );

/**
 * Generic HTTP response schema constructor
 */
const createHttpResponseSchema = <T extends TSchema = any>(
  code: number,
  msgSchema: TSchema,
  dataSchema?: T,
  options?: TObjectOptions,
) =>
  Type.Object(
    {
      code: Type.Literal(code, { format: 'int32', example: code }),
      msg: msgSchema,
      data: Type.Optional(
        dataSchema ? Type.Union([dataSchema, Type.Null()]) : Type.Any({ description: 'response data' }),
      ),
    },
    options,
  );

/**
 * HTTP success/error/redirect response schema
 */
export const createHttpSuccessResponseSchema = <T extends TSchema = any>(dataSchema?: T, options?: TObjectOptions) =>
  createHttpResponseSchema(ResponseCode.SUCCESS, Type.Literal('ok'), dataSchema, options);

export const createHttpErrorResponseSchema = <T extends TSchema = any>(dataSchema?: T, options?: TObjectOptions) =>
  createHttpResponseSchema(ResponseCode.ERROR, Type.String(), dataSchema, options);

export const createHttpRedirectResponseSchema = () =>
  Type.Object({ headers: Type.Object({ location: Type.String({ format: 'uri' }) }) }, { additionalProperties: false });

/**
 * Predefined Response Modes
 */
export const HttpSuccessResponseSchema = createHttpSuccessResponseSchema();
export const HttpErrorResponseSchema = createHttpErrorResponseSchema();
export const HttpRedirectResponseSchema = createHttpRedirectResponseSchema();

/**
 * Generic response schema
 */
export const ResponseSchema = {
  200: HttpSuccessResponseSchema,
  301: HttpRedirectResponseSchema,
  302: HttpRedirectResponseSchema,
  400: HttpErrorResponseSchema,
  500: HttpErrorResponseSchema,
};

/**
 * Create a routing schema with standard responses
 */
export const createRouteSchema = <T extends TSchema = TSchema, R extends TSchema = TSchema>(
  requestSchema?: T,
  responseDataSchema?: R,
) => ({
  ...(requestSchema ? { body: requestSchema } : {}),
  response: {
    200: createHttpSuccessResponseSchema(responseDataSchema),
    301: HttpRedirectResponseSchema,
    302: HttpRedirectResponseSchema,
    400: createHttpErrorResponseSchema(responseDataSchema),
    500: createHttpErrorResponseSchema(responseDataSchema),
  },
});
