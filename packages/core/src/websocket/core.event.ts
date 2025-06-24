export type ICoreEventPayload = {
  timestamp: number;
};

export interface ICoreEventMap {}

export type ICoreEventType = keyof ICoreEventMap;
export type ICoreEvent<TType extends ICoreEventType = ICoreEventType> =
  ICoreEventMap[TType] & ICoreEventPayload;

type OmitBySuffix<T, Suffix extends string> = {
  [K in keyof T as K extends `${string}${Suffix}` ? never : K]: T[K];
};

export type ICoreClientEventMap = OmitBySuffix<ICoreEventMap, ":server">;
export type ICoreServerEventMap = OmitBySuffix<ICoreEventMap, ":client">;

export type ICoreClientEventType = keyof ICoreClientEventMap;
export type ICoreServerEventType = keyof ICoreServerEventMap;

export type ICoreClientEvent = ICoreEvent<ICoreClientEventType>;
export type ICoreServerEvent = ICoreEvent<ICoreServerEventType>;

type MapPayloadToFn<T extends Record<string, unknown>> = {
  [K in keyof T]: (payload: T[K]) => void;
};

export type ICoreClientEventHandlers = MapPayloadToFn<ICoreClientEventMap>;
export type ICoreServerEventHandlers = MapPayloadToFn<ICoreServerEventMap>;
