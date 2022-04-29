import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Image} from "../../../model/image.model";
import {PhegyUser} from "../../../../auth/model/user.model";

@Component({
  selector: 'app-image-drop-down',
  templateUrl: './image-drop-down.component.html',
  styleUrls: ['./image-drop-down.component.css']
})
export class ImageDropDownComponent implements OnInit {
  @Input() image!: Image;
  @Input() authUser!: PhegyUser | null;
  isOpen = false;

  @Output() deleteOption = new EventEmitter<void>();

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (target.classList.contains('image-drop-down-control')) {
        return;
      }
      this.closeDropDown();
    }
  }

  closeDropDown(): void {
    this.isOpen = false;
  }

  toggleDropDown(): void {
    this.isOpen = !this.isOpen;
  }

  delete(): void {
    this.closeDropDown();
    this.deleteOption.next();
  }
}
