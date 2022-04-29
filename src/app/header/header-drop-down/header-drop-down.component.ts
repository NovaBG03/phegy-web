import {Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {ThemeService} from "../../util/theme.service";
import {Observable, Subscription} from "rxjs";
import {PhegyUser} from "../../auth/model/user.model";

@Component({
  selector: 'app-header-drop-down',
  templateUrl: './header-drop-down.component.html',
  styleUrls: ['./header-drop-down.component.css']
})
export class HeaderDropDownComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  user: Observable<PhegyUser | null>;
  isDarkMode = false;
  private themeSub!: Subscription;

  constructor(private eRef: ElementRef,
              private authService: AuthService,
              private themeService: ThemeService) {
    this.user = authService.user;
  }

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkThemeActive()
      .subscribe(isDarkMode => this.isDarkMode = isDarkMode);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (target.classList.contains('header-drop-down-control')) {
        return;
      }

      this.closeDropDown();
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleColorTheme();
  }

  logout(): void {
    this.authService.logout();
    this.close.emit();
  }

  closeDropDown(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }
}
