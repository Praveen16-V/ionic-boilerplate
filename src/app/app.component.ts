import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { AppHeaderComponent } from "./shared/components/app-header/app-header.component";
import { MobileTabsComponent } from "./shared/components/mobile-tabs/mobile-tabs.component";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Platform } from "@ionic/angular";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent, MobileTabsComponent],
})
export class AppComponent {
  isMobile: boolean = false;

  constructor(
    private platform: Platform,
    private themeService: ThemeService,
  ) {
    this.isMobile = false;
    this.initializeStatusBar();
    this.subscribeToThemeChanges();
  }

  private async initializeStatusBar() {
    await this.platform.ready();

    const isDarkMode = this.themeService.isDarkMode();
    if (this.platform.is("hybrid")) {
      try {
        if (this.platform.is("android")) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        await StatusBar.setStyle({
          style: isDarkMode ? Style.Dark : Style.Light,
        });
        await StatusBar.setBackgroundColor({
          color: isDarkMode ? "#121212" : "#ffffff",
        });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch {}
    }
  }

  private subscribeToThemeChanges(): void {
    this.themeService.currentTheme$.subscribe(() => {
      this.updateStatusBarForTheme();
    });
  }

  private async updateStatusBarForTheme(): Promise<void> {
    if (!this.platform.is("hybrid")) return;

    const isDarkMode = this.themeService.isDarkMode();

    try {
      await StatusBar.setStyle({
        style: isDarkMode ? Style.Dark : Style.Light,
      });
      await StatusBar.setBackgroundColor({
        color: isDarkMode ? "#121212" : "#ffffff",
      });
    } catch (error) {
      console.error("Failed to update status bar for theme change:", error);
    }
  }
}
