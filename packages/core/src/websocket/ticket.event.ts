import { ITicketEntity, ITicketResponse } from "../entities";

export enum TicketEvents {
  JOIN_SERVER = "ticket:join:server",
  LEAVE_SERVER = "ticket:leave:server",
  UPDATE_CLIENT = "ticket:update:client",
}

export interface ITicketJoinServerEvent {
  ticketId: ITicketEntity["id"];
}

declare module "./core.event" {
  interface ICoreEventMap {
    [TicketEvents.JOIN_SERVER]: ITicketJoinServerEvent;
    [TicketEvents.LEAVE_SERVER]: never;
    [TicketEvents.UPDATE_CLIENT]: ITicketResponse;
  }
}
