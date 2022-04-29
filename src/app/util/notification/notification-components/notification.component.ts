import {EventEmitter} from "@angular/core";
import {NotificationModel} from "../model/notification.model";

export interface NotificationComponent {
  notification: NotificationModel;
  closed: EventEmitter<void>;
}
