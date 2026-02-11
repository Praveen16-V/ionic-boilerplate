import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkCircleOutline, warningOutline, informationCircleOutline } from 'ionicons/icons';

export interface ErrorOptions {
  message?: string;
  duration?: number;
  showRetry?: boolean;
  retryAction?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      'close-outline': closeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'warning-outline': warningOutline,
      'information-circle-outline': informationCircleOutline
    });
  }

  async showError(options: ErrorOptions = {}) {
    const {
      message = 'An error occurred. Please try again.',
      duration = 3000,
      showRetry = false,
      retryAction
    } = options;

    if (showRetry && retryAction) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Retry',
            handler: () => retryAction()
          }
        ]
      });
      await alert.present();
    } else {
      const toast = await this.toastController.create({
        message: message,
        duration: duration,
        color: 'danger',
        position: 'bottom',
        buttons: [
          {
            icon: 'close-outline',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    }
  }

  async showSuccess(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: 'success',
      position: 'bottom',
      buttons: [
        {
          icon: 'checkmark-circle-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showWarning(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: 'warning',
      position: 'bottom',
      buttons: [
        {
          icon: 'warning-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showInfo(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: 'medium',
      position: 'bottom',
      buttons: [
        {
          icon: 'information-circle-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  handleHttpError(error: any): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    } else if (error.status === 400) {
      return 'Bad request. Please check your input.';
    } else if (error.status === 401) {
      return 'Unauthorized. Please log in again.';
    } else if (error.status === 403) {
      return 'Access denied. You don\'t have permission to perform this action.';
    } else if (error.status === 404) {
      return 'Resource not found.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return error.message || 'An unexpected error occurred.';
    }
  }

  async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    options: ErrorOptions = {}
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const message = options.message || this.handleHttpError(error);
      await this.showError({ ...options, message });
      return null;
    }
  }
}
