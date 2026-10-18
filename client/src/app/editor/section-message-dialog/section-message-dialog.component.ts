import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppSettings } from '../../_models/settings';
import { SettingsService } from '../../_services/settings.service';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface SectionMessageDialogData {
    titleKey: string;
    messageKey: string;
    hideLabelKey: string;
    actionLabelKey?: string;
    routePath?: string;
    absoluteUrl?: string;
    settingKey: 'hideDevicePluginsNotice' | 'hideArMarkersNotice';
}

@Component({
    selector: 'app-section-message-dialog',
    templateUrl: './section-message-dialog.component.html',
    styleUrls: ['./section-message-dialog.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatCheckbox, FormsModule, MatDialogActions, MatButton, TranslatePipe]
})
export class SectionMessageDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<SectionMessageDialogComponent>>(MatDialogRef);
    data = inject<SectionMessageDialogData>(MAT_DIALOG_DATA);
    private router = inject(Router);
    private settingsService = inject(SettingsService);

    hideMessage = false;

    ngOnInit() {
        this.hideMessage = !!this.settingsService.getSettings()?.editorSectionMessages?.[this.data.settingKey];
    }

    onNoClick(): void {
        this.savePreference();
        this.dialogRef.close();
    }

    openSection(): void {
        this.savePreference();
        this.dialogRef.close();
        if (this.data.routePath) {
            this.router.navigateByUrl(this.data.routePath);
        }
    }

    private savePreference(): void {
        const settings = new AppSettings();
        Object.assign(settings, this.settingsService.getSettings());
        settings.editorSectionMessages = {
            ...this.settingsService.getSettings()?.editorSectionMessages,
            [this.data.settingKey]: !!this.hideMessage
        };
        if (this.settingsService.setSettings(settings)) {
            this.settingsService.saveSettings();
        }
    }
}
