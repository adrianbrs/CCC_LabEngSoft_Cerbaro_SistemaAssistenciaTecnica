export type BulkOperationOptions =
  | {
      throttle: number;
      immediate?: boolean;
    }
  | {
      debounce: number;
      maxWait?: number;
    }
  | {
      bulkSize: number;
    };

export function createBulkOperation<T, R>(
  fn: (bulk: T[]) => R | R[] | Promise<R | R[]>,
  options: BulkOperationOptions
) {
  const bulk: T[] = [];
  let waiting: boolean | null = null;
  let tid: NodeJS.Timeout | null = null;
  let maxWaitTid: NodeJS.Timeout | null = null;
  let promise: Promise<R | R[]> | null = null;
  let resolveFn: (res: R | R[] | PromiseLike<R | R[]>) => void = () => {};
  let rejectFn: (err?: unknown) => void = () => {};

  const reset = (): T[] => {
    const copy = bulk.slice();
    bulk.length = 0;
    promise = null;
    waiting = null;
    tid = null;
    resolveFn = () => {};
    rejectFn = () => {};

    if (maxWaitTid !== null) {
      clearTimeout(maxWaitTid);
      maxWaitTid = null;
    }

    return copy;
  };

  const flush = async () => {
    if (!bulk.length) {
      return;
    }

    try {
      // Reset the state synchronously to allow the next item to be added in another bulk
      const copy = reset();
      const res = await Promise.resolve(fn(copy));
      resolveFn(res);
    } catch (err) {
      rejectFn(err);
    }
    bulk.length = 0;
  };

  const queueFlush = () => {
    if ("bulkSize" in options) {
      if (bulk.length >= options.bulkSize) {
        flush();
      }
      return;
    }

    if ("throttle" in options) {
      if (waiting) {
        return;
      }
      if (options.immediate && waiting !== null) {
        flush();
      }

      waiting = true;
      tid = setTimeout(() => {
        waiting = false;
        flush();
      }, options.throttle);
      return;
    }

    if ("debounce" in options) {
      if (tid !== null) {
        clearTimeout(tid);
        tid = null;
      }

      tid = setTimeout(() => {
        flush();
      }, options.debounce);

      if (
        typeof options.maxWait === "number" &&
        options.maxWait > options.debounce &&
        maxWaitTid === null
      ) {
        maxWaitTid = setTimeout(() => {
          flush();
        }, options.maxWait);
      }
      return;
    }

    throw new TypeError(
      `[createBulkOperation] Invalid options provided: ${JSON.stringify(
        options
      )}`
    );
  };

  return async (item: T): Promise<R> => {
    // Copy the promise reference because it will change after flush
    let result = promise;

    if (!result) {
      // If there is no current promise, create a new one for current bulk operation
      result = promise = new Promise<R | R[]>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
    }

    const index = bulk.length;
    bulk.push(item);
    queueFlush();

    return result.then((res) => {
      if (Array.isArray(res)) {
        return res[index];
      }
      return res;
    });
  };
}
