import { Component, OnInit } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { TranslationService } from "../../../core/services/translation.service";
import { ModalController, PopoverController } from "@ionic/angular";
import { LanguagePopoverComponent } from "../language-popover/language-popover.component";
import { addIcons } from "ionicons";
import {
  homeOutline,
  informationCircleOutline,
  personOutline,
  logInOutline,
  logOutOutline,
  sunnyOutline,
  moonOutline,
  languageOutline,
} from "ionicons/icons";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "app-mobile-tabs",
  templateUrl: "./mobile-tabs.component.html",
  styleUrls: ["./mobile-tabs.component.scss"],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class MobileTabsComponent implements OnInit {
  currentUser$!: Observable<any>;
  currentTheme$!: Observable<any>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private translationService: TranslationService,
    private router: Router,
    private modalController: ModalController,
    private popoverController: PopoverController,
  ) {
    addIcons({
      "home-outline": homeOutline,
      "information-circle-outline": informationCircleOutline,
      "person-outline": personOutline,
      "log-in-outline": logInOutline,
      "log-out-outline": logOutOutline,
      "sunny-outline": sunnyOutline,
      "moon-outline": moonOutline,
      "language-outline": languageOutline,
    });

    this.currentUser$ = this.authService.currentUser$;
    this.currentTheme$ = this.themeService.currentTheme$;
  }

  ngOnInit() {}

  async openLanguageModal() {
    const popover = await this.popoverController.create({
      component: LanguagePopoverComponent,
      translucent: true,
      showBackdrop: true,
    });
    await popover.present();
  }

  setLanguage(language: string): void {
    this.translationService.setLanguage(language as any);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
