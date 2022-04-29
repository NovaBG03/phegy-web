import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "../auth.service";
import {filter, map, mergeMap, take} from "rxjs/operators";
import {AuthenticationGuardStrategyFn} from "./auth.guard.strategy";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const guardStrategy = route.data.authGuardStrategy as AuthenticationGuardStrategyFn;
    return this.authService.autoLoginFinished.pipe(
      filter(isFinished => isFinished),
      take(1),
      mergeMap(() => this.authService.user.pipe(
        map(user => guardStrategy(user, this.router))
      ))
    );
  }
}
