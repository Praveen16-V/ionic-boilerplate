import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from './shared/components/app-header/app-header.component';
import { MobileTabsComponent } from './shared/components/mobile-tabs/mobile-tabs.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent, MobileTabsComponent]
})
export class AppComponent {
  isMobile: boolean = false;

  constructor() {
    // Temporarily show both header and mobile tabs for testing
    this.isMobile = false; // Force desktop view to show header
  }
}
