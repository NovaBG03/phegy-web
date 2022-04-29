import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificationModel} from "../../model/notification.model";
import {NotificationComponent} from "../notification.component";
import {NotificationService} from "../../notification.service";

@Component({
  selector: 'app-info-notification',
  templateUrl: './info-notification.component.html',
  styleUrls: ['./info-notification.component.css']
})
export class InfoNotificationComponent implements NotificationComponent, OnInit {
  @Input() notification!: NotificationModel;
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  constructor(public notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  close(): void {
    this.closed.emit();
  }
}
