import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { SettingsService } from '../../_services/settings.service';
import { DiagnoseService } from '../../_services/diagnose.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { AlarmsRetentionType, AppSettings, DaqStore, DaqStoreRetentionType, DaqStoreType, MailMessage, SmtpSettings, StoreCredentials, LogsSettings, AlarmsSettings } from '../../_models/settings';
import { Utils, EnumToArrayPipe } from '../../_helpers/utils';
import { APP_LANGUAGES } from '../../_models/language';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from '../../_directives/number.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSuffix } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-app-settings',
    templateUrl: './app-settings.component.html',
    styleUrls: ['./app-settings.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatTabGroup, MatTab, MatSelect, MatOption, FormsModule, NumberOnlyDirective, MatTooltip, MatSlideToggle, MatSuffix, MatButton, MatDialogActions, TranslatePipe, EnumToArrayPipe]
})
export class AppSettingsComponent implements OnInit {
    private settingsService = inject(SettingsService);
    private diagnoseService = inject(DiagnoseService);
    private translateService = inject(TranslateService);
    private toastr = inject(ToastrService);
    dialogRef = inject<MatDialogRef<AppSettingsComponent>>(MatDialogRef);


    languageType = APP_LANGUAGES.map(language => ({ ...language }));

    authType = [
		{ text: 'dlg.app-auth-disabled', value: '' },
		{ text: 'dlg.app-auth-expiration-15m', value: '15m' },
		{ text: 'dlg.app-auth-expiration-1h', value: '1h' },
		{ text: 'dlg.app-auth-expiration-3h', value: '3h' },
		{ text: 'dlg.app-auth-expiration-1d', value: '1d' }
	];

    nodeRedAuthModeType = [
        { text: 'dlg.app-settings-node-red-auth-secure', value: 'secure' },
        { text: 'dlg.app-settings-node-red-auth-legacy', value: 'legacy-open' }
    ];

    settings = new AppSettings();
    originalNodeRedEnabled = false;
    originalSwaggerEnabled = false;
    originalSecureEnabled = false;
    authentication = '';
    authenticationTooltip = '';
    authOnlyEditorTooltip = '';
    smtpTesting = false;
    smtpTestAddress = '';
    showPassword = false;

    daqstoreType = DaqStoreType;
    retationType = DaqStoreRetentionType;
    alarmsRetationType = AlarmsRetentionType;
    logsRetationType = DaqStoreRetentionType;
    influxDB18 = Utils.getEnumKey(DaqStoreType, DaqStoreType.influxDB18);

    ngOnInit() {
        this.settings = JSON.parse(JSON.stringify(this.settingsService.getSettings()));
        for (let i = 0; i < this.languageType.length; i++) {
            this.languageType[i].text = this.translateService.instant(this.languageType[i].text);
        }
        for (let i = 0; i < this.authType.length; i++) {
            this.authType[i].text = this.translateService.instant(this.authType[i].text);
        }
        for (let i = 0; i < this.nodeRedAuthModeType.length; i++) {
            this.nodeRedAuthModeType[i].text = this.translateService.instant(this.nodeRedAuthModeType[i].text);
        }
        this.translateService.get('dlg.app-auth-tooltip').subscribe((txt: string) => { this.authenticationTooltip = txt; });
        this.translateService.get('dlg.app-settings-auth-only-editor-tooltip').subscribe((txt: string) => { this.authOnlyEditorTooltip = txt; });

        if (this.settings.secureEnabled) {
            this.authentication = this.settings.tokenExpiresIn;
        }
        this.originalSecureEnabled = this.settings.secureEnabled;
        if (Utils.isNullOrUndefined(this.settings.broadcastAll)) {
            this.settings.broadcastAll = true;
        }
        if (Utils.isNullOrUndefined(this.settings.lazyViewLoading)) {
            this.settings.lazyViewLoading = false;
        }
        if (Utils.isNullOrUndefined(this.settings.logFull)) {
            this.settings.logFull = false;
        }
        if (!this.settings.smtp) {
            this.settings.smtp = new SmtpSettings();
        }
        this.settings.daqstore = this.settings.daqstore || new DaqStore();
        if (!this.settings.daqstore.credentials) {
            this.settings.daqstore.credentials = new StoreCredentials();
        }
        if (!this.settings.alarms) {
            this.settings.alarms = new AlarmsSettings();
        }
        if (!this.settings.logs) {
            this.settings.logs = new LogsSettings();
        }
        if (Utils.isNullOrUndefined(this.settings.nodeRedEnabled)) {
            this.settings.nodeRedEnabled = false;
        }
        this.originalNodeRedEnabled = this.settings.nodeRedEnabled;
        if (Utils.isNullOrUndefined(this.settings.nodeRedAuthMode)) {
            this.settings.nodeRedAuthMode = 'secure';
        }

        if (Utils.isNullOrUndefined(this.settings.swaggerEnabled)) {
            this.settings.swaggerEnabled = false;
        }
        this.originalSwaggerEnabled = this.settings.swaggerEnabled;
    }

    onNoClick() {
        this.dialogRef.close();
    }

    onOkClick() {
        if (this.authentication && !this.originalSecureEnabled && (!this.settings.secretCode || !this.settings.secretCode.length)) {
            let msg = this.translateService.instant('msg.secret-code-required');
            this.notifyError(msg);
            return;
        }
        this.settings.secureEnabled = (this.authentication) ? true : false;
        this.settings.tokenExpiresIn = this.authentication;
        if (this.settingsService.setSettings(this.settings)) {
            this.settingsService.saveSettings();
        }
        this.dialogRef.close();
    }

    onLanguageChange(language) {
        this.settings.language = language;
    }

    onAlarmsClear() {
        this.settingsService.clearAlarms(true);
    }

    onSmtpTest() {
        this.smtpTesting = true;
        let msg = <MailMessage>{ from: this.settings.smtp.mailsender || this.settings.smtp.username, to: this.smtpTestAddress, subject: 'FUXA', text: 'TEST' };
        this.diagnoseService.sendMail(msg, this.settings.smtp).subscribe(() => {
            this.smtpTesting = false;
            var msg = '';
            this.translateService.get('msg.sendmail-success').subscribe((txt: string) => { msg = txt; });
            this.toastr.success(msg);
        }, error => {
            this.smtpTesting = false;
            if (error.message) {
                this.notifyError(error.message);
            } else {
                var msg = '';
                this.translateService.get('msg.sendmail-error').subscribe((txt: string) => { msg = txt; });
                this.notifyError(msg);
            }
        });
    }

    isSmtpTestReady() {
        if (this.smtpTesting) {
            return false;
        }
        if (!this.settings.smtp.host || !this.settings.smtp.host.length) {
            return false;
        }
        if (!this.settings.smtp.username || !this.settings.smtp.username.length) {
            return false;
        }
        if (!this.smtpTestAddress || !this.smtpTestAddress.length) {
            return false;
        }
        return true;
    }

    keyDownStopPropagation(event) {
        event.stopPropagation();
    }

    private notifyError(error: string) {
        this.toastr.error(error, '', {
            timeOut: 3000,
            closeButton: true
            // disableTimeOut: true
        });
    }
}
