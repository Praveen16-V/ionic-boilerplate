import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

export interface LoadingOptions {
  message?: string;
  spinner?: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' | null;
  duration?: number;
  backdropDismiss?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingElement: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) {}

  async show(options: LoadingOptions = {}): Promise<void> {
    const {
      message = 'Loading...',
      spinner = 'circles',
      duration = 0,
      backdropDismiss = false
    } = options;

    // Dismiss any existing loading
    await this.dismiss();

    this.loadingElement = await this.loadingController.create({
      message: message,
      spinner: spinner,
      duration: duration,
      backdropDismiss: backdropDismiss,
      cssClass: 'custom-loading'
    });

    await this.loadingElement.present();
  }

  async dismiss(): Promise<void> {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }

  async showWithOperation<T>(
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> {
    await this.show(options);
    
    try {
      const result = await operation();
      await this.dismiss();
      return result;
    } catch (error) {
      await this.dismiss();
      throw error;
    }
  }

  async showWithMessage(message: string): Promise<void> {
    await this.show({ message });
  }

  async showWithSpinner(spinner: LoadingOptions['spinner']): Promise<void> {
    await this.show({ spinner });
  }

  isLoading(): boolean {
    return this.loadingElement !== null;
  }
}
