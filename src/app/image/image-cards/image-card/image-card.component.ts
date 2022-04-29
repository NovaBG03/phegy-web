import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Image} from "../../model/image.model";
import {ImageService} from "../../image.service";
import {UserService} from "../../../user/user.service";
import {AuthService} from "../../../auth/auth.service";
import {AlertService} from "../../../util/alert/alert.service";

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.css']
})
export class ImageCardComponent implements OnInit {
  @Input() image!: Image;
  @Input() isModeratorMode = false;
  @Output() updated = new EventEmitter<void>();

  isVoteOpen = false;

  constructor(public userService: UserService,
              public authService: AuthService,
              private imageService: ImageService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
  }

  approve(): void {
    this.imageService.approveImage(this.image.id)
      .subscribe({
        next: () => {
          this.updated.emit();
          this.alertService.showSuccessAlert(
            'Снимката е одобрена успешно',
            `\'${this.image.title}\' от ${this.image.publisherUsername}`)
        },
        error: err => this.alertService.showErrorAlert(err)
      });
  }

  reject(): void {
    this.imageService.rejectImage(this.image.id)
      .subscribe({
        next: () => {
          this.updated.emit();
          this.alertService.showSuccessAlert(
            `Снимката \'${this.image.title}\' е отхвърлена`,
            `Изпратено е известие до ${this.image.publisherUsername}`);
        },
        error: err => this.alertService.showAlert(err)
      });
  }


  delete(): void {
    this.imageService.deleteImage(this.image.id)
      .subscribe({
        next: () => {
          this.updated.emit();
          this.alertService.showSuccessAlert(
            'Снимката е изтрита',
            `\'${this.image.title}\' изтрит`);
        },
        error: err => this.alertService.showErrorAlert(err)
      });
  }

  startVoting(): void {
    this.isVoteOpen = true;
  }

  finishVoting(): void {
    this.isVoteOpen = false;
  }
}
