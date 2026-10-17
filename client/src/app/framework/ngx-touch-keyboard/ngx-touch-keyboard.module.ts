import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { NgxTouchKeyboardDirective } from './ngx-touch-keyboard.directive';
import { NgxTouchKeyboardComponent } from './ngx-touch-keyboard.component';

@NgModule({
    imports: [CommonModule, OverlayModule, PortalModule, NgxTouchKeyboardDirective, NgxTouchKeyboardComponent],
    exports: [NgxTouchKeyboardDirective, NgxTouchKeyboardComponent],
})
export class NgxTouchKeyboardModule {}
