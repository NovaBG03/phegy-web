import {ComponentFactoryResolver, ComponentRef, Directive, Input, OnDestroy, ViewContainerRef} from '@angular/core';
import {NotificationModel} from "./model/notification.model";
import {NotificationComponent} from "./notification-components/notification.component";
import {NotificationService} from "./notification.service";
import {Subscription} from "rxjs";

@Directive({
  selector: '[appNotificationPlaceholder]'
})
export class NotificationPlaceholderDirective implements OnDestroy {
  private closedSub!: Subscription;

  @Input() set notification(notificationModel: NotificationModel) {
    this.viewContainerRef.clear();

    const componentRef: ComponentRef<NotificationComponent> =
      this.viewContainerRef.createComponent(notificationModel.component);

    componentRef.instance.notification = notificationModel;

    this.closedSub?.unsubscribe();
    componentRef.instance.closed.subscribe(() => {
      this.notificationService.removeNotification(notificationModel);
      this.closedSub?.unsubscribe();

      if (notificationModel.id) {
        this.notificationService.deleteNotificationsFromDb(notificationModel.id);
      }
    })
  }

  constructor(public viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    this.closedSub?.unsubscribe();
  }
}
