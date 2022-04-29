import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../user.service";
import {AuthService} from "../../../auth/auth.service";
import {map, switchMap} from "rxjs/operators";
import {UserAchievements} from "../../model/user.model";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-achievements',
  templateUrl: './profile-achievements.component.html',
  styleUrls: ['./profile-achievements.component.css']
})
export class ProfileAchievementsComponent implements OnInit, OnDestroy {
  @Input('username') set setUsername(username: string) {
    this.selectedUsername = username;
    this.loadAchievements();
  }

  selectedUsername!: string;
  userAchievements!: UserAchievements;

  private achievementsSub!: Subscription;

  constructor(private userService: UserService,
              public authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loadAchievements();
  }

  private loadAchievements() {
    this.achievementsSub?.unsubscribe();
    this.achievementsSub = this.authService.user.pipe(
      map(authUser => {
        if (this.selectedUsername) {
          return this.selectedUsername;
        }
        return authUser?.username;
      }),
      switchMap(username => this.userService.getUserAchievements(username))
    ).subscribe({
      next: userAchievements => this.userAchievements = userAchievements,
      error: () => this.router.navigate(['/'])
    });
  }

  ngOnDestroy(): void {
    this.achievementsSub?.unsubscribe();
  }
}
