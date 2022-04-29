import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {ThemeService} from "./util/theme.service";
import {RxStompService} from "@stomp/ng2-stompjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private authService: AuthService,
              private themeService: ThemeService,
              private stompService: RxStompService) {
  }

  ngOnInit(): void {
    this.stompService.deactivate();
    this.authService.autoLogin();
  }

  ngAfterViewInit(): void {
    this.themeService.startColorThemeManagement();
  }
}
