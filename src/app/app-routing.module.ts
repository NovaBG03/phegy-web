import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {SettingsComponent} from "./user/settings/settings.component";
import {ImageFormComponent} from "./image/image-form/image-form.component";
import {AuthComponent} from "./auth/auth.component";
import {ActivationComponent} from "./auth/activation/activation.component";
import {AuthGuard} from "./auth/guards/auth.guard";
import {ImagePendingComponent} from "./admin/image-pending/image-pending.component";
import * as authGuardStrategy from "./auth/guards/auth.guard.strategy";
import {HomeComponent} from "./home/home.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {TopComponent} from "./top/top.component";


const routes: Routes = [
  {path: '', redirectTo: 'all', pathMatch: 'full'},
  {path: 'all', component: HomeComponent},
  {path: 'top', component: TopComponent},
  {path: 'about', component: AboutComponent},
  {
    path: 'settings', component: SettingsComponent, canActivate: [AuthGuard],
    data: {authGuardStrategy: authGuardStrategy.authenticated()}
  },
  {
    path: 'profile/:username', component: ProfileComponent,
  },
  {
    path: 'upload', component: ImageFormComponent, canActivate: [AuthGuard],
    data: {authGuardStrategy: authGuardStrategy.authenticated()}
  },
  {
    path: 'admin', component: ImagePendingComponent, canActivate: [AuthGuard],
    data: {authGuardStrategy: authGuardStrategy.authenticatedIsModeratorOrAdmin()}
  },
  {
    path: 'register', component: AuthComponent, canActivate: [AuthGuard],
    data: {authGuardStrategy: authGuardStrategy.notAuthenticated()}
  },
  {
    path: 'login', component: AuthComponent, canActivate: [AuthGuard],
    data: {authGuardStrategy: authGuardStrategy.notAuthenticated()}
  },
  {path: 'activate/:token', component: ActivationComponent},
  {path: '**', redirectTo: 'all'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
