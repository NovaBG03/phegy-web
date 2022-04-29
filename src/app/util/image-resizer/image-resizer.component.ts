import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {base64ToFile, ImageCroppedEvent} from "ngx-image-cropper";

@Component({
  selector: 'app-image-resizer',
  templateUrl: './image-resizer.component.html',
  styleUrls: ['./image-resizer.component.css']
})
export class ImageResizerComponent implements OnInit, OnDestroy {
  @Input() image!: File;
  @Input() aspectRatio = 0;
  @Output() imageResized = new EventEmitter<Blob | null>();

  isLoading = true;
  croppedImageBase64: string = '';

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  imageCropped(imageCroppedEvent: ImageCroppedEvent): void {
    if (!imageCroppedEvent.base64) {
      return;
    }
    this.croppedImageBase64 = imageCroppedEvent.base64;
  }

  saveChanges(): void {
    this.imageResized.emit(base64ToFile(this.croppedImageBase64));
  }

  cancelUpload(): void {
    this.imageResized.emit(null);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'no-scroll');
  }

  imageLoaded() {
    this.isLoading = false;
  }
}
