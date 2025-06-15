import type { ICoreEntity } from "@musat/core";
import type { TableColumn } from "@nuxt/ui";
import * as _ from "lodash-es";

export const ENTITY_COLUMNS_END = [
  {
    accessorKey: "createdAt",
    header: "Criado em",
  },
  {
    accessorKey: "updatedAt",
    header: "Atualizado em",
  },
] satisfies TableColumn<ICoreEntity>[];

export const useEntityColumns = () => {
  return _.cloneDeep(ENTITY_COLUMNS_END);
};
