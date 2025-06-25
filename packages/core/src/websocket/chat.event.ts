import { IMessageResponse, ITicketEntity } from "../entities";

export enum ChatEvents {
  MESSAGE_CLIENT = "chat:message:client",
  MESSAGE_SERVER = "chat:message:server",
  MESSAGE_READ = "chat:message:read",
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
    [ChatEvents.MESSAGE_CLIENT]: IMessageResponse;
    [ChatEvents.MESSAGE_SERVER]: [IChatMessageServerEvent, IMessageResponse];
    [ChatEvents.MESSAGE_READ]: [IChatMessageReadEvent, IChatMessageReadEvent];
  }
}
