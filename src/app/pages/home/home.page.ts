import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { Router } from "@angular/router";
import { ModalController, PopoverController } from "@ionic/angular";
import { LanguagePopoverComponent } from "../../shared/components/language-popover/language-popover.component";
import { ThemeService } from "../../core/services/theme.service";
import { TranslateModule } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import {
  informationCircleOutline,
  languageOutline,
  moonOutline,
  personOutline,
} from "ionicons/icons";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
})
export class HomePage implements OnInit {
  userCount = 1234;
  featureCount = 8;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private popoverController: PopoverController,
  ) {
    addIcons({
      "information-circle-outline": informationCircleOutline,
      "language-outline": languageOutline,
      "moon-outline": moonOutline,
      "person-outline": personOutline,
    });
  }

  ngOnInit() {}

  navigateToAbout(): void {
    this.router.navigate(["/about"]);
  }

  navigateToProfile(): void {
    this.router.navigate(["/profile"]);
  }

  async openLanguageModal(): Promise<void> {
    const popover = await this.popoverController.create({
      component: LanguagePopoverComponent,
      translucent: true,
      showBackdrop: true,
    });
    await popover.present();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
