import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {AuthService} from "../../auth/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-profile-image-card',
  templateUrl: './profile-image-card.component.html',
  styleUrls: ['./profile-image-card.component.css']
})
export class ProfileImageCardComponent implements OnInit, OnDestroy {
  acceptedImageTypes = ['image/jpeg', 'image/png'];

  @Input('username') inputUsername!: string;
  authUsername!: string | undefined;

  isResizing = false;
  image: File | null = null;
  resizedImage: Blob | null = null;
  resizedImageUrl: string | null = null;

  private usernameSub!: Subscription;

  get username(): string {
    return this.inputUsername ?? this.authUsername;
  }

  get isEditable(): boolean {
    return this.inputUsername === this.authUsername || !this.inputUsername;
  }

  get acceptedImageTypesString(): string {
    return this.acceptedImageTypes.join(',')
  }

  get profileImage(): any {
    if (this.resizedImageUrl) {
      return this.resizedImageUrl;
    }
    return this.userService.getProfilePicUrl(this.username);
  }

  constructor(private userService: UserService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.usernameSub = this.authService.user
      .subscribe(authUser => {
        this.authUsername = authUser?.username;
      });
  }

  saveImage(): void {
    if (!this.resizedImage) {
      return;
    }
    this.userService.updateProfileImage(this.resizedImage)
      .subscribe(
        () => {
          this.userService.resetProfileImageCache();
          this.setResizedImage(null);
          // this.successPopUpModel.message = 'Your settings picture has been <span class="success-colored-text">updated</span>';
          // this.isReady = true;
        },
        err => {
          this.setResizedImage(null);
          // this.errorPopUpModel.description = err;
        });
  }

  onSelect(files: FileList | null) {
    if (files && this.isImage(files.item(0))) {
      this.image = files.item(0);
      this.isResizing = true;
    } else {
      this.image = null;
      this.resizedImage = null;
      this.resizedImageUrl = null;
      this.isResizing = false;
    }
  }

  setResizedImage(resizedImage: Blob | null): void {
    this.isResizing = false;
    this.resizedImage = resizedImage;

    if (this.resizedImage) {
      const reader = new FileReader();
      reader.readAsDataURL(this.resizedImage);
      reader.onloadend = () => this.resizedImageUrl = reader.result as string;
    }

    if (!this.resizedImage) {
      this.image = null;
      this.resizedImageUrl = null;
    }
  }

  asInputElement(target: EventTarget | null): HTMLInputElement {
    return target as HTMLInputElement;
  }

  ngOnDestroy(): void {
    this.usernameSub?.unsubscribe();
  }

  private isImage(file: File | null): boolean {
    return !!file && this.acceptedImageTypes.includes(file['type'])
  }
}
