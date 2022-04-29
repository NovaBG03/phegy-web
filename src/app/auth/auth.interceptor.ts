import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpHeaders
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from "./auth.service";
import {exhaustMap, take} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        if (!user || user.isExpired) {
          return next.handle(request);
        }
        const headers = {[environment.authHeader]: environment.authPrefix + user.token}
        const modifiedRequest = request.clone({
          headers: new HttpHeaders(headers)
        });
        return next.handle(modifiedRequest);
      })
    );
  }
}
