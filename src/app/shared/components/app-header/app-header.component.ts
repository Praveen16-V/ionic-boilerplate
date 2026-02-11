import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { I18nService } from "../../../core/services/i18n.service";
import { PopoverController } from "@ionic/angular";
import { LanguagePopoverComponent } from "../language-popover/language-popover.component";
import { addIcons } from "ionicons";
import {
  personOutline,
  logInOutline,
  logOutOutline,
  sunnyOutline,
  moonOutline,
  languageOutline,
} from "ionicons/icons";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AppHeaderComponent implements OnInit {
  currentUser$!: Observable<any>;
  currentTheme$!: Observable<any>;
  currentLanguage$!: Observable<any>;
  supportedLanguages: any[] = [];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private i18nService: I18nService,
    private router: Router,
    private popoverController: PopoverController,
  ) {
    addIcons({
      "person-outline": personOutline,
      "log-in-outline": logInOutline,
      "log-out-outline": logOutOutline,
      "sunny-outline": sunnyOutline,
      "moon-outline": moonOutline,
      "language-outline": languageOutline,
    });

    this.currentUser$ = this.authService.currentUser$;
    this.currentTheme$ = this.themeService.currentTheme$;
    this.currentLanguage$ = of(this.i18nService.getCurrentLanguage());
    this.supportedLanguages = this.i18nService.getSupportedLanguages();
  }

  ngOnInit() {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLanguage(language: string): void {
    this.i18nService.setLanguage(language);
  }

  async openLanguagePopover(event: Event) {
    const popover = await this.popoverController.create({
      component: LanguagePopoverComponent,
      event: event,
      translucent: true,
    });
    await popover.present();
  }

  navigateToProfile(): void {
    this.router.navigate(["/profile"]);
  }

  navigateToLogin(): void {
    this.router.navigate(["/login"]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/home"]);
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
