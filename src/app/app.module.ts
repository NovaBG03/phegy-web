import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {ImageListComponent} from './image/image-list/image-list.component';
import {AboutComponent} from './about/about.component';
import {SettingsComponent} from './user/settings/settings.component';
import {ImageCardComponent} from './image/image-cards/image-card/image-card.component';
import {EmptyImageCardComponent} from './image/image-cards/empty-image-card/empty-image-card.component';
import {ImageFormComponent} from './image/image-form/image-form.component';
import {AuthComponent} from './auth/auth.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HeaderDropDownComponent} from './header/header-drop-down/header-drop-down.component';
import {ActivationComponent} from './auth/activation/activation.component';
import {SpinnerComponent} from './util/spinner/spinner.component';
import {AlertPopUpComponent} from './util/alert/alert-pop-up/alert-pop-up.component';
import {AuthInterceptor} from "./auth/auth.interceptor";
import {ImageCropperModule} from "ngx-image-cropper";
import {ImageResizerComponent} from './util/image-resizer/image-resizer.component';
import {PaginationComponent} from './util/pagination/pagination.component';
import {ImagePendingComponent} from './admin/image-pending/image-pending.component';
import {NotificationPanelComponent} from "./util/notification/notification-panel/notification-panel.component";
import {
  InfoNotificationComponent
} from './util/notification/notification-components/info-notification/info-notification.component';
import {
  EmailNotificationComponent
} from './util/notification/notification-components/email-notification/email-notification.component';
import {NotificationPlaceholderDirective} from './util/notification/notification-placeholder.directive';
import {InjectableRxStompConfig, RxStompService, rxStompServiceFactory} from "@stomp/ng2-stompjs";
import {RxStompConfig} from "./rx-stomp-config";
import {PointsBagComponent} from './points/points-bag/points-bag.component';
import {VoteComponent} from './points/vote/vote.component';
import {environment} from "../environments/environment";
import {ImageDropDownComponent} from './image/image-cards/image-card/image-drop-down/image-drop-down.component';
import {HomeComponent} from './home/home.component';
import {ProfileComponent} from './user/profile/profile.component';
import {ProfileImageCardComponent} from './user/profile-image-card/profile-image-card.component';
import {SettingsFormComponent} from './user/settings/settings-form/settings-form.component';
import { ProfileAchievementsComponent } from './user/profile/achievements/profile-achievements.component';
import { AlertPanelComponent } from './util/alert/alert-panel/alert-panel.component';
import { ImageOrderFilterComponent } from './image/image-list/image-order-filter/image-order-filter.component';
import { TopComponent } from './top/top.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxMasonryModule} from "ngx-masonry";
import {NoCommaPipe} from "./util/pipe/no-comma.pipe";

@NgModule({
  declarations: [
    NoCommaPipe,
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ImageListComponent,
    AboutComponent,
    SettingsComponent,
    ImageCardComponent,
    EmptyImageCardComponent,
    ImageFormComponent,
    AuthComponent,
    HeaderDropDownComponent,
    ActivationComponent,
    SpinnerComponent,
    AlertPopUpComponent,
    ImageResizerComponent,
    PaginationComponent,
    ImagePendingComponent,
    NotificationPanelComponent,
    InfoNotificationComponent,
    EmailNotificationComponent,
    NotificationPlaceholderDirective,
    PointsBagComponent,
    VoteComponent,
    ImageDropDownComponent,
    HomeComponent,
    ProfileComponent,
    ProfileImageCardComponent,
    SettingsFormComponent,
    ProfileAchievementsComponent,
    AlertPanelComponent,
    ImageOrderFilterComponent,
    TopComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ImageCropperModule,
    NgxMasonryModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: InjectableRxStompConfig,
      useValue: RxStompConfig,
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => validateDomain,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

function validateDomain() {
  if (environment.production && location.hostname !== environment.phegyDomain) {
    window.location.href = location.protocol + "//" + environment.phegyDomain + location.pathname;
  }
}
