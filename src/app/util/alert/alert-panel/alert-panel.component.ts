import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService} from "../alert.service";
import {PopUpModel} from "../model/pop-up-model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-alert-panel',
  templateUrl: './alert-panel.component.html',
  styleUrls: ['./alert-panel.component.css']
})
export class AlertPanelComponent implements OnInit, OnDestroy {
  activeAlert: PopUpModel | null = null;
  private alertSub: Subscription;

  constructor(alertService: AlertService) {
    this.alertSub = alertService.alert$.subscribe(alert => this.activeAlert = alert);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.alertSub?.unsubscribe();
  }
}
