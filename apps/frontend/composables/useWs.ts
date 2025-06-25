import type {
  ICoreEventGetPayload,
  ICoreEventGetResponse,
  ICoreServerEventType,
} from "@musat/core";

type EventTypesWithResponse = {
  [K in ICoreServerEventType as ICoreEventGetResponse<K> extends never
    ? never
    : K]: K;
} extends infer T
  ? T[keyof T]
  : never;

export function useWs() {
  const { $socket: ws } = useNuxtApp();

  const emitAsync = <
    TEvent extends EventTypesWithResponse,
    TPayload extends ICoreEventGetPayload<TEvent>,
    TResult extends ICoreEventGetResponse<TEvent>
  >(
    event: TEvent,
    payload: TPayload
  ): Promise<TResult> => {
    return new Promise<TResult>((resolve, reject) => {
      ws.emit(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event as any,
        payload,
        (res: TResult) => {
          ws.off("exception", reject);
          resolve(res);
        }
      );
      ws.once("exception", reject);
    });
  };

  return {
    ws,
    emitAsync,
  };
}
