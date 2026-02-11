import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(private platform: Platform) {}

  isMobile(): boolean {
    return this.platform.is('mobile') || this.platform.is('mobileweb');
  }

  isDesktop(): boolean {
    return this.platform.is('desktop') || this.platform.is('electron');
  }

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  isHybrid(): boolean {
    return Capacitor.isPluginAvailable('Capacitor');
  }

  getPlatform(): string {
    if (this.platform.is('ios')) return 'iOS';
    if (this.platform.is('android')) return 'Android';
    if (this.platform.is('electron')) return 'Electron';
    return 'Web';
  }

  async isReady(): Promise<void> {
    await this.platform.ready();
  }
}
