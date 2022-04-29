import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationCategory, NotificationModel} from "../model/notification.model";
import {NotificationService} from "../notification.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  maxNotificationsCount = 4;
  allNotificationsCount = 0;
  notifications: NotificationModel[] = [];
  showNotifications = false;
  private notificationSub!: Subscription;

  get showClean(): boolean {
    return this.showNotifications
      && this.notifications.length > 1;
  }

  get notificationsCount(): string | null {
    const count = this.allNotificationsCount;
    if (count === 0) {
      return null;
    }
    return count > this.maxNotificationsCount ?
      this.maxNotificationsCount + '+' : count.toString();
  }

  get dominatingCategory(): string {
    const categoryMap = new Map<NotificationCategory, number>();

    this.notifications.forEach(({category}) => {
      const currentCount = categoryMap.get(category);
      if (currentCount) {
        categoryMap.set(category, currentCount + 1);
        return;
      }
      categoryMap.set(category, 1);
    });

    let selectedCategory = {count: 0, category: NotificationCategory.Info};
    categoryMap.forEach(((currentCount, currentCategory) => {
      if (currentCount > selectedCategory.count) {
        selectedCategory = {count: currentCount, category: currentCategory}
      }
    }));

    return selectedCategory.category;
  }

  constructor(public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.updateNotifications();
    this.notificationSub = this.notificationService.notificationsChanged()
      .subscribe(() => this.updateNotifications());
  }

  toggleShowNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  private updateNotifications(): void {
    this.allNotificationsCount = this.notificationService.notificationsCount;
    const notifications = this.notificationService.getNotifications(this.maxNotificationsCount);
    if (!notifications || !notifications.length) {
      this.showNotifications = false;
    } else if (notifications.length === 1) {
      this.showNotifications = true;
    } else if (this.notifications.length === 1) {
      this.showNotifications = false;
    }

    this.notifications = notifications;
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }
}
