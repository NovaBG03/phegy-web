import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificationComponent} from "../notification.component";
import {NotificationModel} from "../../model/notification.model";
import {NotificationService} from "../../notification.service";
import {AuthService} from "../../../../auth/auth.service";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-email-info-notification',
  templateUrl: './email-notification.component.html',
  styleUrls: ['./email-notification.component.css']
})
export class EmailNotificationComponent implements NotificationComponent, OnInit {
  @Input() notification!: NotificationModel;
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  secondsLeft = 0;
  private countdownInterval: any;

  constructor(public notificationService: NotificationService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    clearInterval(this.countdownInterval);
    let dateStr = localStorage.getItem(environment.newRequestDateKey);
    if (dateStr) {
      const newRequestDate = new Date(dateStr);
      const secondsLeft = (newRequestDate.getTime() - new Date().getTime()) / 1000;
      if (secondsLeft > 0) {
        this.setDelay(secondsLeft);
      }
      else {
        localStorage.removeItem(environment.newRequestDateKey);
      }
    }
  }

  close(): void {
    this.closed.emit();
  }

  requestVerification(): void {
    this.authService.requestActivationLink()
      .subscribe(
        seconds => {
          this.setDelay(seconds);
        },
        err => {
          if (!isNaN(err)) {
            this.setDelay(err);
          }
        });
  }

  private setDelay(seconds: number) {
    this.secondsLeft = seconds;
    const endDate = new Date();
    endDate.setSeconds(endDate.getSeconds() + this.secondsLeft);
    localStorage.setItem(environment.newRequestDateKey, endDate.toLocaleString());
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        localStorage.removeItem(environment.newRequestDateKey);
        this.countdownInterval = undefined;
        this.secondsLeft = 0;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}
