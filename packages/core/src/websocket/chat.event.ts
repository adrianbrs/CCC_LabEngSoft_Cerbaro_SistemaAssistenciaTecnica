import { IMessageResponse, ITicketEntity } from "../entities";

export enum ChatEvents {
  JOIN_SERVER = "chat:join:server",
  LEAVE_SERVER = "chat:leave:server",
  MESSAGE_CLIENT = "chat:message:client",
  MESSAGE_SERVER = "chat:message:server",
  MESSAGE_READ = "chat:message:read",
}

export interface IChatJoinServerEvent {
  ticketId: ITicketEntity["id"];
}

export interface IChatMessageServerEvent {
  ticketId: ITicketEntity["id"];
  content: string;
}

export interface IChatMessageReadEvent {
  ticketId: ITicketEntity["id"];
  messageIds: string[];
}

declare module "./core.event" {
  interface ICoreEventMap {
    [ChatEvents.JOIN_SERVER]: IChatJoinServerEvent;
    [ChatEvents.LEAVE_SERVER]: never;
    [ChatEvents.MESSAGE_CLIENT]: IMessageResponse;
    [ChatEvents.MESSAGE_SERVER]: [IChatMessageServerEvent, IMessageResponse];
    [ChatEvents.MESSAGE_READ]: IChatMessageReadEvent;
  }
}
