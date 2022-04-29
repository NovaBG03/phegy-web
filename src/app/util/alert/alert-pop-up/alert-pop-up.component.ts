import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {PopUpModel} from "../model/pop-up-model";

@Component({
  selector: 'app-alert-pop-up',
  templateUrl: './alert-pop-up.component.html',
  styleUrls: ['./alert-pop-up.component.css']
})
export class AlertPopUpComponent implements OnInit, OnDestroy {
  @Input() model!: PopUpModel;
  @Output() buttonPressed = new EventEmitter<void>();

  get getButtonStyleClass(): string {
    if (!this.model || !this.model.buttonStyle) {
      return '';
    }
    return `btn-${this.model.buttonStyle}`;
  }

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  onButtonPressed(): void {
    this.buttonPressed.emit();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'no-scroll');
  }
}
