import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(private platform: Platform) {}

  isMobile(): boolean {
    return this.platform.is('mobile') || this.platform.is('mobileweb');
  }

  isDesktop(): boolean {
    return this.platform.is('desktop') || this.platform.is('pwa');
  }

  isTablet(): boolean {
    return this.platform.is('tablet');
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }

  isAndroid(): boolean {
    return this.platform.is('android');
  }

  getPlatform(): string {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    if (this.isDesktop()) return 'desktop';
    return 'unknown';
  }

  width(): Observable<number> {
    return fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
      startWith(window.innerWidth)
    );
  }

  height(): Observable<number> {
    return fromEvent(window, 'resize').pipe(
      map(() => window.innerHeight),
      startWith(window.innerHeight)
    );
  }

  ready(): Promise<string> {
    return this.platform.ready();
  }
}
