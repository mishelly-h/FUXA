import { Component, ElementRef, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

import { AuthService } from '../_services/auth.service';
import { ProjectService } from '../_services/project.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgxTouchKeyboardDirective } from '../framework/ngx-touch-keyboard/ngx-touch-keyboard.directive';
import { LoginOverlayColorType } from '../_models/hmi';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatError, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatError, MatIcon, MatSuffix, MatProgressSpinner, MatDialogActions, MatButton, MatDialogClose, NgxTouchKeyboardDirective, TranslatePipe]
})
export class LoginComponent {

    @ViewChild('touchKeyboard', {static: false}) touchKeyboard: NgxTouchKeyboardDirective;

	loading = false;
	showPassword = false;
	submitLoading = false;
	messageError: string;
	username: UntypedFormControl = new UntypedFormControl();
	password: UntypedFormControl = new UntypedFormControl();
	errorEnabled = false;
	disableCancel = false;

	constructor(private authService: AuthService,
				private projectService: ProjectService,
				private translateService: TranslateService,
				private dialogRef: MatDialogRef<LoginComponent>,
				@Inject(MAT_DIALOG_DATA) private data: any) {
		const hmi = this.projectService.getHmi();
		this.disableCancel = hmi?.layout?.loginonstart && hmi.layout?.loginoverlaycolor !== LoginOverlayColorType.none;
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onOkClick(): void {
		this.errorEnabled = true;
		this.messageError = '';
		this.signIn();
	}

	isValidate() {
		if (this.username.value && this.password.value) {
			return true;
		}
		return false;
	}

	signIn() {
		this.submitLoading = true;
		this.authService.signIn(this.username.value, this.password.value).subscribe(result => {
			this.submitLoading = false;
			this.dialogRef.close(true);
			this.projectService.reload();
		}, error => {
			this.submitLoading = false;
			this.translateService.get('msg.signin-failed').subscribe((txt: string) => this.messageError = txt);
		});
	}

    keyDownStopPropagation(event) {
        event.stopPropagation();
    }

	onFocus(event: FocusEvent) {
		const hmi = this.projectService.getHmi();
		if (hmi?.layout?.inputdialog?.includes('keyboard')) {
			if (hmi.layout.inputdialog === 'keyboardFullScreen') {
				this.touchKeyboard.ngxTouchKeyboardFullScreen = true;
			}
			this.touchKeyboard.closePanel();
			const targetElement = event.target as HTMLInputElement;
			const elementRef = new ElementRef<HTMLInputElement>(targetElement);
			this.touchKeyboard.openPanel(elementRef);
		}
    }
}
