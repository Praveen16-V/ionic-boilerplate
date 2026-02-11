import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-language-popover',
  templateUrl: './language-popover.component.html',
  styleUrls: ['./language-popover.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LanguagePopoverComponent implements OnInit {
  supportedLanguages: any[] = [];
  currentLanguage: string = '';

  constructor(
    private popoverController: PopoverController,
    private i18nService: I18nService
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline
    });
    this.supportedLanguages = this.i18nService.getSupportedLanguages();
  }

  ngOnInit() {
    // Set initial language
    this.currentLanguage = this.i18nService.getCurrentLanguage();
  }

  selectLanguage(languageCode: string) {
    this.i18nService.setLanguage(languageCode);
    this.dismiss();
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}
