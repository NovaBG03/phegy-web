import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, concatMap, map, tap} from "rxjs/operators";
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {PhegyUser} from "./model/user.model";
import {Router} from "@angular/router";
import {AuthTokens} from "./model/jwt.model";
import {NotificationService} from "../util/notification/notification.service";
import {
  EmailNotificationComponent
} from "../util/notification/notification-components/email-notification/email-notification.component";
import {NotificationCategory} from "../util/notification/model/notification.model";
import {
  InfoNotificationComponent
} from "../util/notification/notification-components/info-notification/info-notification.component";
import {RxStompService} from "@stomp/ng2-stompjs";

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<PhegyUser | null>(null);
  autoLoginFinished = new BehaviorSubject(false);
  private logOutTimeout: any;

  constructor(private http: HttpClient,
              private router: Router,
              private stompService: RxStompService,
              private notificationService: NotificationService) {
  }

  register(username: string, email: string, password: string): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/register`;
    const body = {username, email, password};
    return this.http.post(url, body, {observe: "response"})
      .pipe(
        catchError(err => {
          let message = 'Something went wrong!';
          switch (err.error.message) {
            case 'USER_USERNAME_EXISTS':
              message = `Потребител ${username} вече съществува!`;
              break;
            case 'USER_EMAIL_EXISTS':
              message = `Потребител с електронна поща ${email} вече съществува`;
              break;
            case 'USER_USERNAME_INVALID':
              message = `Невалидно потребителско име: ${username}`;
              break;
            case 'USER_EMAIL_INVALID':
              message = `Невалидна електронна поща: ${email}`;
              break;
          }

          return throwError(message);
        })
      )
  }

  activate(token: string): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/activate/${token}`;
    const body = {};
    return this.http.post(url, body, {observe: "response"})
      .pipe(
        catchError(() => {
          let message = 'Невалидна или изтекла връзка за кативиране!';
          return throwError(message);
        })
      );
  }

  requestActivationLink(): Observable<number> {
    const url = `${environment.phegyApiUrl}/api/v1/requestActivation`;
    const body = {};
    return this.http.post<{ secondsTillNextRequest: number }>(url, body)
      .pipe(
        map(res => res.secondsTillNextRequest),
        catchError(err => {
          let message: string | number = 'Нещо се обърка!';

          if (err.error.message === 'USER_ALREADY_ENABLED') {
            this.refresh();
            message = 'Профилът вече е активиран';
          } else if (err.error.message.startsWith('CAN_NOT_SENT_NEW_TOKEN_SECONDS_LEFT_')) {
            message = +err.error.message.substring('CAN_NOT_SENT_NEW_TOKEN_SECONDS_LEFT_'.length);
          }
          return throwError(message);
        })
      );
  }

  refreshAccess(refreshToken: string): Observable<PhegyUser> {
    const url = `${environment.phegyApiUrl}/api/v1/refresh/${refreshToken}`;
    const body = {};
    return this.http.post(url, body, {observe: "response"}).pipe(
      map(resp => {
        const {authToken, refreshToken} = AuthService.getTokens(resp);
        const user = this.authenticate(authToken, refreshToken);
        if (user instanceof PhegyUser) {
          return user;
        }
        throw new Error("REFRESH_TOKEN_INVALID");
      }),
      catchError(err => {
        switch (err.error.message) {
          case 'REFRESH_TOKEN_INVALID':
            this.logout();
            return throwError('Невалиден или изтекъл достъп!');
        }
        return throwError(err);
      })
    );
  }

  refresh(): void {
    const refreshToken = this.user.getValue()?.refreshToken;
    if (refreshToken) {
      this.refreshAccess(refreshToken).subscribe();
    }
  }

  login(username: string, password: string): Observable<PhegyUser> {
    const url = `${environment.phegyApiUrl}/login`;
    const body = {username, password};

    return this.http.post(url, body, {observe: "response"})
      .pipe(
        tap(() => this.notificationService.clearLoadedNotifications()),
        map(resp => {
          const {authToken, refreshToken} = AuthService.getTokens(resp);
          return this.authenticate(authToken, refreshToken);
        }),
        concatMap(userOrRefreshToken => {
          if (userOrRefreshToken instanceof PhegyUser) {
            return of(userOrRefreshToken);
          }
          return this.refreshAccess(userOrRefreshToken);
        }),
        catchError(err => {
          let message = 'Нещо се обърка!';

          switch (err.status) {
            case 403:
              message = 'Невалидно име или парола';
              break;
          }

          return throwError(message);
        })
      );
  }

  logout(): void {
    this.user.next(null);
    localStorage.removeItem(environment.authTokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.newRequestDateKey);
    if (this.logOutTimeout) {
      clearTimeout(this.logOutTimeout);
      this.logOutTimeout = null;
    }

    this.notificationService.stopListening();
    this.notificationService.clearLoadedNotifications();

    this.stompService.deactivate();
    this.notificationService.pushNotification({
      component: InfoNotificationComponent,
      category: NotificationCategory.Info,
      title: 'Излязохте от профила си',
      message: 'Лек ден :)'
    });
    this.router.navigate(['/']);
  }

  autoLogin(): void {
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);

    if (!refreshToken) {
      localStorage.removeItem(environment.authTokenKey);
      this.autoLoginFinished.next(true)
      return;
    }

    this.refreshAccess(refreshToken)
      .subscribe(
        () => this.autoLoginFinished.next(true),
        () => this.autoLoginFinished.next(true));
  }

  private autoLogout(user: PhegyUser): void {
    this.logOutTimeout = setTimeout(
      () => {
        const refreshToken = localStorage.getItem(environment.refreshTokenKey);
        if (!refreshToken) {
          this.logout();
          return;
        }
        this.refreshAccess(refreshToken).subscribe();
      },
      user.secondsUntilExpiration
    );
  }

  private authenticate(authToken: string, refreshToken: string): PhegyUser | string {
    const user = new PhegyUser(authToken, refreshToken);

    if (user.isExpired) {
      return refreshToken;
    }

    localStorage.setItem(environment.authTokenKey, authToken)
    localStorage.setItem(environment.refreshTokenKey, refreshToken)
    this.autoLogout(user);
    this.user.next(user);

    this.checkAccountStatus(user);
    this.stompService.activate();
    this.notificationService.listenForNotifications();

    return user;
  }

  private checkAccountStatus(user: PhegyUser | null) {
    if (user?.isNotConfirmed) {
      this.notificationService.pushNotification({
        component: EmailNotificationComponent,
        category: NotificationCategory.Danger,
        title: 'Електронната поща не е потвърдене',
        message: 'Моля, потвърдете имейла си, за да получите достъп до всички функции на сайта!'
      });
    } else {
      this.notificationService.removeEmailConfirmation();
    }
  }

  private static getTokens(resp: HttpResponse<Object>): AuthTokens {
    const authHeader = resp.headers.get(environment.authHeader);
    const authToken = authHeader?.substr(environment.authPrefix.length);
    if (!authToken) {
      throw new Error(`${environment.authHeader} header missing!`);
    }

    const refreshHeader = resp.headers.get(environment.refreshHeader);
    const refreshToken = refreshHeader?.substr(environment.refreshPrefix.length);
    if (!refreshToken) {
      throw new Error(`${environment.refreshHeader} header missing!`);
    }

    return {authToken, refreshToken};
  }
}
