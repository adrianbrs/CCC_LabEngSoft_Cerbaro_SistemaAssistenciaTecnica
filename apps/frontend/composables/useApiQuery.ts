import type { UseFetchOptions } from "nuxt/app";
import type { InjectionKey } from "vue";

type ApiAsyncData<
  T extends ReturnType<typeof useFetch>,
  TQuery extends SearchQuery
> = T extends Promise<infer R>
  ? R & {
      query: UseSearchQueryReturn<TQuery>;
    } & Promise<
        R & {
          query: UseSearchQueryReturn<TQuery>;
        }
      >
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseApiQuery = Record<string, any>;

export type UseApiUrl =
  | string
  | Request
  | Ref<string | Request>
  | (() => string | Request);

export type UseApiOptions<
  TEntity = unknown,
  TQuery extends UseApiQuery = UseApiQuery,
  TResult = TEntity
> = Omit<UseFetchOptions<TEntity, TResult>, "params" | "query"> & {
  params?: MaybeRefOrGetter<TQuery>;
  query?: MaybeRefOrGetter<TQuery>;
  queryOptions?: MaybeRefOrGetter<UseSearchQueryOptions<TQuery>>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UseApiQueryReturn<
  TEntity = any,
  TQuery extends UseApiQuery = any,
  TResult = TEntity
> = ReturnType<typeof useApiQuery<TEntity, TQuery, TResult>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

const API_QUERY_CTX = Symbol(
  "API_QUERY_CTX"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as InjectionKey<UseApiQueryReturn<any, any, any>>;

export function useApiQuery<
  TEntity = unknown,
  TQuery extends UseApiQuery = UseApiQuery,
  TResult = TEntity
>(url: UseApiUrl, options?: UseApiOptions<TEntity, TQuery, TResult>) {
  const api = useApi();
  const {
    params,
    query: userQuery = params,
    queryOptions,
    ...apiOptions
  } = options ?? {};

  const query = useSearchQuery<TQuery>(
    () => ({ ...toValue(userQuery) } as TQuery),
    queryOptions
  );

  const fetchReturn = useFetch(url, {
    ...apiOptions,
    query: query.result,
    $fetch: api,
  });

  const ctx = fetchReturn as ApiAsyncData<typeof fetchReturn, TQuery>;

  // Add the query to the non-promise result
  ctx.query = query;

  const then = ctx.then.bind(ctx);
  ctx.then = ((...args: Parameters<typeof then>) =>
    then()
      .then((asyncData) => ({
        ...asyncData,
        // Add the query to the promise resolved data
        query,
      }))
      .then(...args)).bind(ctx) as typeof then;

  provide(API_QUERY_CTX, ctx);

  return ctx;
}

export function useApiQueryCtx<
  TContext extends UseApiQueryReturn = UseApiQueryReturn
>(required: false): TContext | undefined;
export function useApiQueryCtx<
  TContext extends UseApiQueryReturn = UseApiQueryReturn
>(required: true): TContext;
export function useApiQueryCtx<
  TContext extends UseApiQueryReturn = UseApiQueryReturn
>(override?: TContext): TContext;
export function useApiQueryCtx(
  overrideOrRequired?: UseApiQueryReturn | boolean
) {
  const ctx =
    (typeof overrideOrRequired === "boolean" ? null : overrideOrRequired) ??
    inject(API_QUERY_CTX);
  if (!ctx && overrideOrRequired !== false) {
    throw new Error(
      "useApiQueryCtx must be used within a useApiQuery context or provide it explicitly."
    );
  }
  return ctx;
}
