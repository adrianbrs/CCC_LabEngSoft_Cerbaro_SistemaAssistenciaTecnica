import * as _ from "lodash-es";
import type { Reactive } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SearchQuery = Record<string, any>;

export type SanitizedSearchQuery<T extends SearchQuery = SearchQuery> = {
  [K in keyof T]: T[K] | undefined | null;
};

export type SearchQueryModifiers<T extends SearchQuery = SearchQuery> =
  ReturnType<typeof buildQueryModifiers<T>> extends infer M
    ? {
        [K in keyof M]?: M[K] extends (...args: never[]) => unknown
          ? Parameters<M[K]>[1]
          : never;
      }
    : never;

export interface UseSearchQueryOptions<T extends SearchQuery = SearchQuery> {
  /**
   * Debounce time in milliseconds for `debouncedQuery` changes to take effect.
   *
   * @default 300
   */
  debounce?: number;

  /**
   * Modifiers to apply to the query.
   */
  modifiers?: SearchQueryModifiers<T>;
}

export interface UseSearchQueryReturn<T extends SearchQuery> {
  /**
   * The initial query object that was passed to the composable.
   */
  initialQuery: Reactive<T>;

  /**
   * The computed query object that should be used to make API calls.
   */
  result: ComputedRef<SanitizedSearchQuery<T>>;

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
   * Reset the query to a specific state.
   */
  reset(query: T): void;
  /**
   * Reset the specified keys in the query to their initial values.
   */
  reset(keys: T | (keyof T)[]): void;
  /**
   * Resets the query to the initial state.
   */
  reset(): void;
}

type ModifierCtx<T extends SearchQuery = SearchQuery> = {
  query: T;
  options?: UseSearchQueryOptions<T>;
};
type ModifierFn<T extends SearchQuery = SearchQuery> = (
  ctx: ModifierCtx<T>,
  opts: never
) => unknown;

const buildQueryModifiers = <T extends SearchQuery = SearchQuery>() =>
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

export const useSearchQuery = <T extends SearchQuery>(
  query: MaybeRefOrGetter<T>,
  options?: MaybeRefOrGetter<UseSearchQueryOptions<T>>
): UseSearchQueryReturn<T> => {
  const initialQueryRaw = toRaw(toValue(query));
  const initialQuery = reactive<T>(_.cloneDeep(initialQueryRaw));
  const model = reactive<T>(_.cloneDeep(initialQueryRaw));
  const modelDebounce = reactive<T>(_.cloneDeep(initialQueryRaw));
  const isDirty = ref(false);

  watch(initialQuery, (newInitialQuery) => {
    if (!isDirty.value) {
      assignReset(model, toRaw(newInitialQuery));
    }
  });

  watch(
    () => toValue(query),
    (newQuery) => {
      Object.assign(model, toRaw(newQuery));
    },
    { deep: true }
  );

  watchDebounced(
    modelDebounce,
    () => {
      if (!_.isMatch(model, modelDebounce)) {
        Object.assign(model, toRaw(modelDebounce));
      }
    },
    { debounce: () => toValue(options)?.debounce ?? 300 }
  );

  watch(model, (newModel) => {
    if (!_.isEqual(modelDebounce, newModel)) {
      assignReset(modelDebounce, toRaw(newModel));
    }
  });

  const reset = (keysOrState?: T | (keyof T)[]) => {
    if (
      keysOrState &&
      typeof keysOrState === "object" &&
      !Array.isArray(keysOrState)
    ) {
      if (_.isPlainObject(keysOrState)) {
        assignReset(initialQuery, keysOrState);
        assignReset(model, keysOrState);
        return;
      }
      console.warn(`[useSearchQuery] Invalid reset argument`, keysOrState);
    }

    const internalKeys = [
      ...new Set(
        (keysOrState?.length
          ? keysOrState
          : Object.keys(initialQuery).concat(
              Object.keys(toRaw(model)),
              Object.keys(toRaw(modelDebounce))
            )) as (keyof T)[]
      ),
    ];

    internalKeys.forEach((key) => {
      if (key in initialQuery) {
        (model as T)[key] = (initialQuery as T)[key];
      } else if (!keysOrState?.length) {
        // If no keys are specified, reset the entire query
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (model as T)[key];
      }
    });
  };

  const modifiers = computed(() => {
    const modifiersOpts = toValue(options)?.modifiers;
    return _.omitBy(QUERY_MODIFIERS, (_, name) => {
      return modifiersOpts?.[name as keyof typeof modifiersOpts] === false;
    }) as Partial<typeof QUERY_MODIFIERS>;
  });

  const result = computed((): SanitizedSearchQuery<T> => {
    const modifiersOpts = toValue(options)?.modifiers;
    const query = Object.entries(modifiers.value).reduce(
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
    return toRaw(query);
  });

  watch(result, (newResult) => {
    isDirty.value = !_.isEqual(
      _.omitBy(newResult, _.isNil),
      _.omitBy(initialQuery, _.isNil)
    );
  });

  return {
    isDirty: computed(() => isDirty.value),
    initialQuery: initialQuery,
    modelDebounce: modelDebounce,
    model,
    result,
    reset,
  };
};
