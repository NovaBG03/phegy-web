import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {concatMap, map} from "rxjs/operators";
import {AuthService} from "../auth.service";
import {throwError} from "rxjs";

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {
  isReady = false;
  errorMessage = '';
  secondsLeft = 10;

  private interval: any;

  constructor(private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(paramMap => paramMap.get('token')),
        concatMap(token => {
          if (!token) {
            return throwError('Невалидни данни!')
          }
          return this.authService.activate(token);
        })
      ).subscribe(
      () => {
        this.isReady = true;
        this.authService.refresh();
        this.startTimer();
      },
      err => {
        this.errorMessage = err;
        this.isReady = true;
        this.startTimer();
      }
    );
  }

  private startTimer(): void {
    this.interval = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        clearInterval(this.interval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}
