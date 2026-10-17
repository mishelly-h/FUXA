import { CommonModule } from '@angular/common';
import {  type ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { DaterangepickerComponent } from './daterangepicker.component';
import { DaterangepickerDirective } from './daterangepicker.directive';
import { LocaleConfig, LOCALE_CONFIG } from './daterangepicker.config';
import { LocaleService } from './locale.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DaterangepickerComponent,
        DaterangepickerDirective
    ],
    providers: [],
    exports: [
        DaterangepickerComponent,
        DaterangepickerDirective
    ]
})
export class NgxDaterangepickerMd {
  constructor() {
  }
  static forRoot(config: LocaleConfig = {}): ModuleWithProviders<any> {
    return {
      ngModule: NgxDaterangepickerMd,
      providers: [
        { provide: LOCALE_CONFIG, useValue: config},
        { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG]}
      ]
    };
  }
}
