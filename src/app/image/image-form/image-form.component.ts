import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {ImageService} from "../image.service";
import * as CustomValidators from "../../util/validation/custom-validator.functions";
import {AlertService} from "../../util/alert/alert.service";

@Component({
  selector: 'app-image-form',
  templateUrl: './image-form.component.html',
  styleUrls: ['./image-form.component.css']
})
export class ImageFormComponent implements OnInit {
  acceptedImageTypes = ['image/jpeg', 'image/png'];
  isLoading = false;

  isResizing = false;
  imageFile: File | null = null;
  resizedImage: Blob | null = null;

  imageForm!: FormGroup;

  get title(): AbstractControl {
    return this.getControl('title');
  }

  get description(): AbstractControl {
    return this.getControl('description');
  }

  get imageFileName() {
    return (this.imageFile as File).name
  }

  constructor(private imageService: ImageService, private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.initImageForm();
  }

  onSelect(files: FileList | null) {
    if (files && this.isImage(files.item(0))) {
      this.imageFile = files.item(0);
      this.isResizing = true;
    } else {
      this.imageFile = null;
      this.resizedImage = null;
      this.isResizing = false;
    }
  }

  setResizedImage(resizedImage: Blob | null): void {
    this.isResizing = false;
    this.resizedImage = resizedImage;

    if (!resizedImage) {
      this.imageFile = null;
    }
  }

  onSubmit(): void {
    if (this.imageForm.invalid) {
      this.alertService.showErrorAlert("Данните за снимка не са попълнени правилно")
      return;
    }

    if (!this.resizedImage) {
      this.alertService.showErrorAlert("Няма избрана снимка")
      return;
    }

    this.isLoading = true;
    this.imageService.postImage(this.resizedImage, this.title.value, this.description.value)
      .subscribe(() => {
          this.imageForm.reset();
          this.resizedImage = null;
          this.imageFile = null;
          this.isLoading = false;
          this.alertService.showSuccessAlert(
            'Снимката е <span class="success-colored-text">качена успешно</span>',
            'В най-скоро време ще бъде прегледана от някой от екипа ни');
        },
        err => {
          this.isLoading = false;
          this.alertService.showErrorAlert(err)
        });
  }

  asInputElement(target: EventTarget | null): HTMLInputElement {
    return target as HTMLInputElement;
  }

  private isImage(file: File | null): boolean {
    return !!file && this.acceptedImageTypes.includes(file['type'])
  }

  private initImageForm(): void {
    this.imageForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        CustomValidators.notOnlyWhitespaceValidator()
      ]),
      description: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(100)
      ])
    });
  }

  private getControl(controlName: string): AbstractControl {
    return this.imageForm.get(controlName) as AbstractControl;
  }
}
