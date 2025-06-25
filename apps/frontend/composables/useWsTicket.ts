import type { ITicketResponse } from "@musat/core";

export interface UseWsTicketOptions {
  onUpdate?: (ticket: ITicketResponse) => void;
}

export function useWsTicket(
  ticketId: MaybeRefOrGetter<string>,
  options?: UseWsTicketOptions
) {
  const { ws } = useWs();
  const { onUpdate } = options ?? {};

  onMounted(() => {
    ws.emit(TicketEvents.JOIN_SERVER, {
      ticketId: toValue(ticketId),
    });

    if (onUpdate) {
      ws.on(TicketEvents.UPDATE_CLIENT, onUpdate);
    }
  });

  onUnmounted(() => {
    ws.emit(TicketEvents.LEAVE_SERVER);

    if (onUpdate) {
      ws.off(TicketEvents.UPDATE_CLIENT, onUpdate);
    }
  });

  watch(
    () => toValue(ticketId),
    (newId) => {
      if (!newId) {
        ws.emit(TicketEvents.LEAVE_SERVER);
        return;
      }

      ws.emit(TicketEvents.JOIN_SERVER, {
        ticketId: newId,
      });
    }
  );
}
