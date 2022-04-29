import {Authority} from "../model/authority.model";
import {PhegyUser} from "../model/user.model";
import {Router, UrlTree} from "@angular/router";

export type AuthenticationGuardStrategyFn = (user: (PhegyUser | null), router: Router) => boolean | UrlTree;

export function notAuthenticated(): AuthenticationGuardStrategyFn {
  return (user, router) => {
    return !user ? true : router.createUrlTree(['/']);
  }
}

export function authenticated(): AuthenticationGuardStrategyFn {
  return (user, router) => {
    return user ? true : router.createUrlTree(['/']);
  }
}

export function authenticatedIsModeratorOrAdmin(): AuthenticationGuardStrategyFn {
  return authenticatedHasAnyAuthority([Authority.Admin, Authority.Moderator]);
}

export function authenticatedHasAnyAuthority(authorities: Authority[]): AuthenticationGuardStrategyFn {
  return (user, router) => {
    return user?.hasAnyAuthority(authorities) ? true : router.createUrlTree(['/']);
  }
}
