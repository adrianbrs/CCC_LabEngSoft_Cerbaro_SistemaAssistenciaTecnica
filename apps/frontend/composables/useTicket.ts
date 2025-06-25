import type { ITicketEntity, ITicketResponse } from "@musat/core";
import * as _ from "lodash-es";

export const useTicket = (id: MaybeRefOrGetter<ITicketEntity["id"]>) => {
  const { data: ticket, ...api } = useApiQuery<ITicketResponse>(
    () => uri`/tickets/${toValue(id) ?? ""}`
  );

  useWsTicket(id, {
    onUpdate: (newTicket) => {
      if (ticket.value) {
        _.merge(ticket.value, newTicket);
      } else {
        ticket.value = newTicket;
      }
    },
  });

  return {
    ...api,
    ticket,
  };
};
