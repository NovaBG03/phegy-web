import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";
import * as CustomValidators from "../util/validation/custom-validator.functions";
import {AlertService} from "../util/alert/alert.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isRegister = true;
  imageSrc = '';
  errorMessage = '';
  isLoading = false;

  authForm!: FormGroup;

  get username(): AbstractControl {
    return this.getControl('username');
  }

  get email(): AbstractControl {
    return this.getControl('email');
  }

  get passwords(): AbstractControl {
    return this.getControl('passwords');
  }

  get password(): AbstractControl {
    return this.passwords?.get('password') as AbstractControl;
  }

  get confirmed(): AbstractControl {
    return this.passwords?.get('confirmed') as AbstractControl;
  }

  private urlSub!: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.urlSub = this.route.url
      .pipe(map(urlSegment => urlSegment[0].path))
      .subscribe(url => {
        this.isRegister = url === 'register'
        if (this.isRegister) {
          this.imageSrc = '/assets/images/purple-sky.jpg';
        } else {
          this.imageSrc = '/assets/images/purple-sun.jpg';
        }
        this.initAuthForm();
      });
  }

  ngOnDestroy(): void {
    this.urlSub?.unsubscribe();
  }

  onAuthenticate(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.authForm.invalid) {
      this.errorMessage = 'Невалидно въведени данни';
      this.isLoading = false;
      return;
    }
    const data = this.authForm.value;

    if (this.isRegister) {
      this.authService.register(data.username, data.email, data.passwords.password)
        .subscribe({
          next: () => {
            this.alertService.showAlert({
              bannerPath: 'assets/svgs/email.svg',
              message: '<span class="secondary-colored-text">Успешна</span> регистрация',
              description: 'Моля, щракнете върху връзката за активиране, която изпратихме на вашия имейл',
              buttonText: 'Добре'
            });
            this.router.navigate(['/login']);
            this.isLoading = false;
          },
          error: err => {
            this.errorMessage = err;
            this.isLoading = false;
          }
        });
      return;
    }

    this.authService.login(data.username, data.passwords.password)
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: err => {
          this.errorMessage = err;
          this.isLoading = false;
        }
      });
  }

  private getControl(controlName: string): AbstractControl {
    return this.authForm.get(controlName) as AbstractControl;
  }

  private initAuthForm() {
    this.authForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      passwords: new FormGroup({
        password: new FormControl('', [Validators.required])
      })
    });

    if (this.isRegister) {
      this.authForm.get('username')?.setValidators([
        Validators.required,
        Validators.minLength(environment.minUsernameLength),
        Validators.maxLength(environment.maxUsernameLength),
        CustomValidators.notOnlyWhitespaceValidator()
      ]);

      this.authForm.addControl('email',
        new FormControl('', [
          Validators.required,
          Validators.minLength(environment.minEmailLength),
          Validators.maxLength(environment.maxEmailLength),
          Validators.email
        ]));

      const passwordsGroup = this.authForm.get('passwords') as FormGroup;

      passwordsGroup.setValidators(
        CustomValidators.isPasswordConfirmedValidator('password', 'confirmed'));

      passwordsGroup.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(environment.minPasswordLength),
        Validators.maxLength(environment.maxPasswordLength),
        CustomValidators.hasDigitsValidator(),
        CustomValidators.hasAlphabeticCharacters()
      ]);

      passwordsGroup.addControl('confirmed',
        new FormControl('', [
          Validators.required,
          Validators.minLength(environment.minPasswordLength),
          Validators.maxLength(environment.maxPasswordLength),
          CustomValidators.hasDigitsValidator(),
          CustomValidators.hasAlphabeticCharacters()
        ]));
    }
  }
}
