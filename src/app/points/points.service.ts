import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {PointsBag} from "./model/points.model";
import {PointsBagDto, VoteDto} from "./model/points.dto";
import {environment} from "../../environments/environment";
import {catchError, map, tap} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Injectable({providedIn: 'root'})
export class PointsService {
  private timeoutMinutes = 1;
  private pointsBagSubject = new BehaviorSubject<PointsBag | null>(null);
  private balanceCheckTimeOut: any;

  constructor(private http: HttpClient, authService: AuthService) {
    authService.user.subscribe(user => {
      if (user) {
        this.updatePointsBag();
        return;
      }

      this.stopBalanceCheck();
      this.pointsBagSubject.next(null);
    });
  }

  listenPointsBag(): Observable<PointsBag | null> {
    return this.pointsBagSubject.asObservable();
  }

  updatePointsBag(): void {
    this.scheduleBalanceCheck(this.timeoutMinutes);
    const url = `${environment.phegyApiUrl}/api/v1/points/bag`;
    this.http.get<PointsBagDto>(url)
      .pipe(
        map(dto => PointsService.pointsBagDtoToPointsBag(dto))
      )
      .subscribe(pointsBag => this.pointsBagSubject.next(pointsBag));
  }

  vote(imageId: number, points: number): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/points/vote`;
    const body: VoteDto = {
      imageId,
      points: points
    }
    return this.http.post(url, body, {observe: 'response'})
      .pipe(
        tap(() => this.updatePointsBag()),
        catchError(err => {
          let errMessage = "Нещо се обърка!";
          switch (err.error.message) {
            case 'NOT_ENOUGH_POINTS_TO_VOTE':
              errMessage = 'Недостатъчно точки за да гласувате';
              break;
            case 'ALREADY_VOTED':
              errMessage = 'Вече сте гласували за тази снимка';
              break;
            case 'VOTE_POINTS_TOO_LOW':
              errMessage = 'Прекалено малко точки';
              break;
            case 'VOTE_POINTS_TOO_HIGH':
              errMessage = 'Прекалено много точки';
              break;
            case 'CAN_NOT_VOTE_FOR_OWNING_IMAGES':
              errMessage = 'Не можеш да гласуваш за своя снимка';
              break;
          }
          return throwError(errMessage);
        })
      );
  }

  private scheduleBalanceCheck(minutes: number) {
    clearTimeout(this.balanceCheckTimeOut);
    this.balanceCheckTimeOut = setTimeout(() => {
      this.updatePointsBag();
    }, 60000 * minutes)
  }

  private stopBalanceCheck(): void {
    clearTimeout(this.balanceCheckTimeOut);
  }

  private static pointsBagDtoToPointsBag(dto: PointsBagDto): PointsBag {
    return {
      username: dto.username,
      points: dto.points
    };
  }
}
