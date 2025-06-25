export type ICoreEventPayload = {
  timestamp: number;
};

export interface ICoreEventMap {}

export type ICoreEventType = keyof ICoreEventMap;
export type ICoreEvent<TType extends ICoreEventType = ICoreEventType> =
  | Extract<ICoreEventMap[TType], unknown[]>[0]
  | Exclude<ICoreEventMap[TType], unknown[]>;
export type ICoreEventAck<TType extends ICoreEventType = ICoreEventType> =
  Extract<ICoreEventMap[TType], unknown[]>[1];

type OmitBySuffix<T, Suffix extends string> = {
  [K in keyof T as K extends `${string}${Suffix}` ? never : K]: T[K];
};

export type ICoreEventNormalized<TType extends ICoreEventType> =
  ICoreEventMap[TType] extends never
    ? []
    : ICoreEventMap[TType] extends [infer P, infer R]
    ? [payload: P, response: R]
    : [payload: ICoreEventMap[TType]];

export type ICoreEventGetPayload<TType extends ICoreEventType> =
  ICoreEventNormalized<TType> extends [payload: infer P, response: unknown]
    ? P
    : never;
export type ICoreEventGetResponse<TType extends ICoreEventType> =
  ICoreEventNormalized<TType> extends [payload: unknown, response: infer R]
    ? R
    : never;

export type ICoreClientEventMap = OmitBySuffix<ICoreEventMap, ":server">;
export type ICoreServerEventMap = OmitBySuffix<ICoreEventMap, ":client">;

export type ICoreClientEventType = keyof ICoreClientEventMap;
export type ICoreServerEventType = keyof ICoreServerEventMap;

export type ICoreClientEvent = ICoreEvent<ICoreClientEventType>;
export type ICoreServerEvent = ICoreEvent<ICoreServerEventType>;

type MapPayloadToFn<T extends Record<string, unknown | [unknown, unknown]>> = {
  [K in keyof T]: (
    ...args: T[K] extends never
      ? []
      : T[K] extends [infer P, infer R]
      ? [payload: P, ack?: (response: R) => any]
      : [payload: T[K]]
  ) => void;
};

export type ICoreClientEventHandlers = MapPayloadToFn<ICoreClientEventMap>;
export type ICoreServerEventHandlers = MapPayloadToFn<ICoreServerEventMap>;
