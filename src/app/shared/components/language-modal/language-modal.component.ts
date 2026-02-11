import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslationService } from '../../../core/services/translation.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-language-modal',
  templateUrl: './language-modal.component.html',
  styleUrls: ['./language-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LanguageModalComponent {
  supportedLanguages: any[] = [];
  currentLanguage: string = '';

  constructor(
    private modalController: ModalController,
    private translationService: TranslationService
  ) {
    addIcons({
      'close-outline': closeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });
    this.supportedLanguages = this.translationService.supportedLanguages;
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  selectLanguage(languageCode: string) {
    this.translationService.setLanguage(languageCode as any);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
