import { INotificationResponse } from "../entities";

export enum NotificationEvents {
  RECEIVE_CLIENT = "notification:receive:client",
  READ = "notification:read",
  REMOVE = "notification:remove",
}

export interface INotificationReadEvent {
  notificationIds: string[];
}

export interface INotificationDeleteEvent {
  notificationIds: string[];
}

declare module "./core.event" {
  interface ICoreEventMap {
    [NotificationEvents.RECEIVE_CLIENT]: INotificationResponse;
    [NotificationEvents.READ]: [INotificationReadEvent, INotificationReadEvent];
    [NotificationEvents.REMOVE]: [
      INotificationDeleteEvent,
      INotificationDeleteEvent
    ];
  }
}
