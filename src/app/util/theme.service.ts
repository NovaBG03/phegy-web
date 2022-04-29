import {Injectable, Renderer2, RendererFactory2} from "@angular/core";
import {environment} from "../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class ThemeService {
  private renderer: Renderer2;

  private lightTheme = 'light-theme';
  private darkTheme = 'dark-theme';
  private approvedThemes = [this.lightTheme, this.darkTheme];

  private activeTheme = this.lightTheme;
  private themeSubject = new BehaviorSubject(this.activeTheme);

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  startColorThemeManagement(): void {
    this.renderer.removeClass(document.body, this.activeTheme);

    const preferredTheme = localStorage.getItem(environment.preferredThemeKey);
    if (preferredTheme
      && this.approvedThemes.includes(preferredTheme)) {
      this.activeTheme = preferredTheme;
    } else if (!!window.matchMedia
      && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.activeTheme = this.darkTheme;
    }

    this.themeSubject.next(this.activeTheme);
    this.renderer.addClass(document.body, this.activeTheme);
  }

  toggleColorTheme(): void {
    this.renderer.removeClass(document.body, this.activeTheme);

    if (this.activeTheme === this.lightTheme) {
      this.activeTheme = this.darkTheme;
    } else {
      this.activeTheme = this.lightTheme;
    }

    localStorage.setItem(environment.preferredThemeKey, this.activeTheme);

    this.themeSubject.next(this.activeTheme);
    this.renderer.addClass(document.body, this.activeTheme);
  }

  isDarkThemeActive(): Observable<boolean> {
    return this.getActiveTheme()
      .pipe(
        map(theme => this.darkTheme === theme)
      );
  }

  getActiveTheme(): Observable<string> {
    return this.themeSubject.asObservable();
  }
}
