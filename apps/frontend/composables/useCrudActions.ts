import type { ICoreEntity } from "@musat/core";
import type { Simplify } from "type-fest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CrudActionRecord = Record<PropertyKey, any>;

export type CrudActions<
  TEntity extends ICoreEntity = ICoreEntity,
  TActionRecord extends CrudActionRecord | unknown = unknown
> = {
  create: {
    resource?: TEntity;
  };
  read: {
    resource?: Pick<TEntity, "id">;
  };
  update: {
    resource: TEntity;
  };
  delete: {
    resource: TEntity;
  };
} & TActionRecord;

export type CrudActionType<TActions extends CrudActions = CrudActions> =
  keyof TActions;
export type CrudActionOptions<
  TActions extends CrudActions = CrudActions,
  TActionType extends CrudActionType<TActions> = CrudActionType<TActions>
> = TActions[TActionType];
export type CrudAction<
  TActions extends CrudActions = CrudActions,
  TActionType extends CrudActionType<TActions> = CrudActionType<TActions>
> = {
  [K in TActionType]: Simplify<
    {
      type: K;
    } & (CrudActionOptions<TActions, K> extends never
      ? unknown
      : CrudActionOptions<TActions, K>)
  >;
}[TActionType];

export type SetActionArgs<
  TActions extends CrudActions = CrudActions,
  TActionType extends CrudActionType<TActions> = CrudActionType<TActions>
> = TActions[TActionType] extends never
  ? [type: TActionType]
  : Partial<TActions[TActionType]> extends TActions[TActionType]
  ? [type: TActionType, options?: CrudActionOptions<TActions, TActionType>]
  : [type: TActionType, options: CrudActionOptions<TActions, TActionType>];

export interface UseCrudActionsReturn<
  TEntity extends ICoreEntity = ICoreEntity,
  TActionRecord extends CrudActionRecord | unknown = unknown,
  TActions extends CrudActions<TEntity, TActionRecord> = CrudActions<
    TEntity,
    TActionRecord
  >
> {
  action: Ref<CrudAction<TActions> | null>;
  setAction: <TActionType extends CrudActionType<TActions>>(
    ...args: SetActionArgs<TActions, TActionType>
  ) => void;
  clearAction: () => void;
}

export function useCrudActions<
  TEntity extends ICoreEntity = ICoreEntity,
  TActionRecord extends CrudActionRecord | unknown = unknown,
  TActions extends CrudActions<TEntity, TActionRecord> = CrudActions<
    TEntity,
    TActionRecord
  >
>(): UseCrudActionsReturn<TEntity, TActionRecord, TActions> {
  const action = ref(null) as Ref<CrudAction<TActions> | null>;

  const setAction = <TActionType extends CrudActionType<TActions>>(
    ...args: SetActionArgs<TActions, TActionType>
  ) => {
    const [type, options] = args;
    action.value = { type, ...(options || {}) } as CrudAction<
      TActions,
      TActionType
    >;
  };

  const clearAction = () => {
    action.value = null;
  };

  return {
    action,
    setAction,
    clearAction,
  };
}
