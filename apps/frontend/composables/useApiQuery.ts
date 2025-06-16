import * as _ from "lodash-es";
import type { Reactive } from "vue";

export type ApiQuery = object;

export type SanitizedApiQuery<T extends ApiQuery = ApiQuery> = {
  [K in keyof T]: T[K] | undefined | null;
};

export type ApiQueryModifiers<T extends ApiQuery = ApiQuery> = ReturnType<
  typeof buildQueryModifiers<T>
> extends infer M
  ? {
      [K in keyof M]?: M[K] extends (...args: never[]) => unknown
        ? Parameters<M[K]>[1]
        : never;
    }
  : never;

export interface UseApiQueryOptions<T extends ApiQuery = ApiQuery> {
  /**
   * Debounce time in milliseconds for `debouncedQuery` changes to take effect.
   *
   * @default 300
   */
  debounce?: number;

  /**
   * Modifiers to apply to the query.
   */
  modifiers?: ApiQueryModifiers<T>;
}

export interface UseApiQueryReturn<T extends ApiQuery> {
  /**
   * The initial query object that was passed to the composable.
   */
  initialValue: ComputedRef<T>;

  /**
   * The computed query object that should be used to make API calls.
   */
  result: ComputedRef<SanitizedApiQuery<T>>;

  /**
   * The same as the `query` object, but updates are debounced.
   *
   * Changes made to `debouncedQuery` will not immediately affect the `query` object,
   * but changes made to `query` will update `debouncedQuery` immediately.
   */
  modelDebounce: Reactive<T>;

  /**
   * The reactive query object that can be used to modify the API query,
   */
  model: Reactive<T>;

  /**
   * A boolean indicating whether the current query is different from the initial query.
   */
  isDirty: ComputedRef<boolean>;

  /**
   * Reset the specified keys in the query to their initial values.
   */
  reset(keys: (keyof T)[]): void;
  /**
   * Resets the query to the initial state.
   */
  reset(): void;
}

type ModifierCtx<T extends ApiQuery = ApiQuery> = {
  query: T;
  options?: UseApiQueryOptions<T>;
};
type ModifierFn<T extends ApiQuery = ApiQuery> = (
  ctx: ModifierCtx<T>,
  opts: never
) => unknown;

const buildQueryModifiers = <T extends ApiQuery = ApiQuery>() =>
  ({
    /**
     * Sets a value to `undefined` if it is empty, otherwise returns the value.
     */
    allowEmpty: (
      { query }: ModifierCtx<T>,
      allow: boolean | (keyof T)[] = false
    ) => {
      if (allow === true) {
        return query;
      }
      return _.omitBy(query, (value: unknown, key) => {
        if (
          value == null ||
          (Array.isArray(allow) && allow.includes(key as keyof T))
        ) {
          return false;
        }
        if (
          (Array.isArray(value) || typeof value === "string") &&
          !value.length
        ) {
          return true;
        }
        return false;
      });
    },
  } satisfies Record<string, ModifierFn<T>>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QUERY_MODIFIERS = buildQueryModifiers<any>();

export const useApiQuery = <T extends ApiQuery>(
  initialQuery: MaybeRefOrGetter<T>,
  options?: MaybeRefOrGetter<UseApiQueryOptions<T>>
): UseApiQueryReturn<T> => {
  const computedInitialQuery = computed(() => toValue(initialQuery));
  const model = reactive<T>(_.cloneDeep(toValue(computedInitialQuery)));
  const modelDebounce = reactive<T>(_.cloneDeep(toValue(computedInitialQuery)));
  const isDirty = ref(false);

  watchDebounced(
    modelDebounce,
    () => {
      if (!_.isEqual(toValue(modelDebounce), computedInitialQuery)) {
        Object.assign(model, modelDebounce);
      }
    },
    { debounce: () => toValue(options)?.debounce ?? 300 }
  );

  watch(computedInitialQuery, (newInitialQuery) => {
    if (!isDirty.value) {
      Object.assign(model, newInitialQuery);
    }
  });

  watch(model, (newModel) => {
    Object.assign(modelDebounce, toRaw(newModel));
  });

  const reset = (keys?: (keyof T)[]) => {
    const internalKeys = [
      ...new Set(
        (keys?.length
          ? keys
          : Object.keys(computedInitialQuery.value).concat(
              Object.keys(toRaw(model)),
              Object.keys(toRaw(modelDebounce))
            )) as (keyof T)[]
      ),
    ];

    internalKeys.forEach((key) => {
      if (key in computedInitialQuery.value) {
        (model as T)[key] = computedInitialQuery.value[key];
        (modelDebounce as T)[key] = computedInitialQuery.value[key];
      } else if (!keys?.length) {
        // If no keys are specified, reset the entire query
        /* eslint-disable @typescript-eslint/no-dynamic-delete */
        delete (model as T)[key];
        delete (modelDebounce as T)[key];
        /* eslint-enable @typescript-eslint/no-dynamic-delete */
      }
    });
  };

  const modifiers = computed(() => {
    const modifiersOpts = toValue(options)?.modifiers;
    return _.omitBy(QUERY_MODIFIERS, (_, name) => {
      return modifiersOpts?.[name as keyof typeof modifiersOpts] === false;
    }) as Partial<typeof QUERY_MODIFIERS>;
  });

  const result = computed((): SanitizedApiQuery<T> => {
    const modifiersOpts = toValue(options)?.modifiers;
    return Object.entries(modifiers.value).reduce(
      (result, [name, modifier]) => {
        const ctx: ModifierCtx<T> = {
          query: result,
          options: toValue(options),
        };
        return modifier(
          ctx,
          modifiersOpts?.[name as keyof typeof modifiersOpts]
        );
      },
      _.cloneDeep(toValue(model))
    );
  });

  watch(result, (newResult) => {
    isDirty.value = !_.isEqual(
      _.omitBy(newResult, _.isNil),
      _.omitBy(toValue(computedInitialQuery), _.isNil)
    );
  });

  return {
    isDirty: computed(() => isDirty.value),
    initialValue: computedInitialQuery,
    modelDebounce: modelDebounce,
    model,
    result,
    reset,
  };
};
