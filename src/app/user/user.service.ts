import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {Authority} from "../auth/model/authority.model";
import {Achievement, UserAchievements, UserInfo} from "./model/user.model";
import {
  AchievementDto,
  ChangePasswordDto,
  UserAchievementsDto,
  UserInfoDto,
  ChangeEmailDto
} from "./model/user.dto";

@Injectable({providedIn: 'root'})
export class UserService {
  private postFix = '';

  constructor(private http: HttpClient) {
  }

  getUserAchievements(username: string | undefined): Observable<UserAchievements> {
    if (!username) {
      return throwError("");
    }

    const url = `${environment.phegyApiUrl}/api/v1/achievements/${username}`;
    return this.http.get<UserAchievementsDto>(url)
      .pipe(
        map(dto => UserService.userAchievementsDtoToUserAchievements(dto)),
      );
  }

  getUserInfo(): Observable<UserInfo> {
    const url = `${environment.phegyApiUrl}/api/v1/me`;
    return this.http.get<UserInfoDto>(url)
      .pipe(
        map(userInfoDto => this.userInfoDtoToUserInfo(userInfoDto)),
      );
  }

  changeEmail(emailDto: ChangeEmailDto): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/me/email`;
    return this.http.post(url, emailDto)
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';
          switch (err.error.message) {
            case 'USER_EMAIL_EXISTS':
              message = `Вече има потребител с електронна поща: ${emailDto.email}`;
              break;
            case 'USER_EMAIL_INVALID':
              message = `Невалидна електронна поща: ${emailDto.email}`;
              break;
          }

          return throwError(message);
        })
      );
  }

  changePassword(passwords: ChangePasswordDto): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/me/password`
    return this.http.post(url, passwords, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';
          switch (err.error.message) {
            case 'PASSWORDS_DOES_NOT_MATCH':
              message = 'Паролите не съвпадат';
              break;
            case 'WRONG_OLD_PASSWORD':
              message = `Невалидна сегашна парола`;
              break;
            case 'NEW_PASSWORD_AND_OLD_PASSWORD_ARE_THE_SAME':
              message = 'Новата парола и старата парола не могат да бъдат еднакви';
              break;
          }

          return throwError(message);
        })
      );
  }

  updateProfileImage(image: Blob): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/me/image`
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post(url, formData, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';
          switch (err.error.message) {
            case 'USER_NOT_CONFIRMED':
              message = 'Трябва да потвърдите електронната си поща преди да имате достъп до тази фукнционалнст';
              break;
          }
          return throwError(message);
        })
      );
  }

  private userInfoDtoToUserInfo(dto: UserInfoDto): UserInfo {
    return new UserInfo(
      dto.username,
      dto.email,
      new Date(dto.enabledAt),
      dto.authorities.map(x => x.authority as Authority)
    )
  }

  getProfilePicUrl(username: string): string {
    return `${environment.phegyCdnUrl}/user/${username}.png` + this.postFix;
  }

  resetProfileImageCache(): void {
    this.postFix = '?' + new Date().getTime();
  }

  private static userAchievementsDtoToUserAchievements(dto: UserAchievementsDto): UserAchievements {
    return {
      username: dto.username,
      achievements: dto.achievements.map(a => UserService.achievementDtoToAchievement(a))
    };
  }

  private static achievementDtoToAchievement(dto: AchievementDto): Achievement {
    return {
      name: dto.name,
      value: dto.value
    };
  }
}
