import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {PointsService} from "../points.service";
import {Image} from "../../image/model/image.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../util/notification/notification.service";
import {NotificationCategory} from "../../util/notification/model/notification.model";
import {
  InfoNotificationComponent
} from "../../util/notification/notification-components/info-notification/info-notification.component";

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit, OnDestroy {
  @Input() image!: Image;
  @Output() close = new EventEmitter<void>();

  voteForm!: FormGroup;
  errMessage = '';
  isLoading = true;

  get pointsControl(): FormControl {
    return <FormControl>this.voteForm.get('points');
  }

  constructor(private pointsService: PointsService,
              private notificationService: NotificationService,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'no-scroll');
    this.initVoteForm();
    this.isLoading = false;
  }

  vote(): void {
    this.isLoading = true;
    const points = Math.round(this.voteForm.value.points * 10) / 10

    this.pointsService.vote(this.image.id, points)
      .subscribe({
        next: () => {
          this.notificationService.pushNotification({
            component: InfoNotificationComponent,
            category: NotificationCategory.Success,
            title: 'Вотът е записан',
            message: `Успешно дадохте ${points} точки на ${this.image.publisherUsername}.`
          })
          this.image.points += points;
          this.close.emit();
          this.isLoading = false;
        },
        error: err => {
          this.isLoading = false;
          this.errMessage = err;
        },
        complete: () => this.isLoading = false
      });
  }

  onClose(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'no-scroll');
  }

  private initVoteForm() {
    this.voteForm = new FormGroup({
      points: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ])
    });
  }
}
