import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ScriptMode } from '../../_models/script';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ProjectService } from '../../_services/project.service';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../_helpers/utils';

@Component({
    selector: 'app-script-mode',
    templateUrl: './script-mode.component.html',
    styleUrls: ['./script-mode.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, MatDialogActions, MatButton, TranslatePipe, EnumToArrayPipe]
})
export class ScriptModeComponent implements OnInit {

	formGroup: UntypedFormGroup;

	scriptMode = ScriptMode;
	existingNames = [];

	constructor(public dialogRef: MatDialogRef<ScriptModeComponent>,
		private translateService: TranslateService,
		private projectService: ProjectService,
		private fb: UntypedFormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ScriptModeType) {
	}

	ngOnInit() {
		this.existingNames = this.projectService.getScripts()?.map(script => script.name);

		this.formGroup = this.fb.group({
			name: [this.data.name],
			mode: [this.data.mode, Validators.required],
		});
		if (this.data.newScript) {
			this.formGroup.controls.name.setValidators([Validators.required, this.isValidScriptName()]);
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onOkClick(): void {
		this.dialogRef.close(this.formGroup.getRawValue());
	}

	isValidScriptName(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value?.trim();
			if (!value) {
				return null;
			}
			const functionNameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
			if (!functionNameRegex.test(value)) {
				return { message: this.translateService.instant('msg.invalid-script-name') };
			}
			if (this.existingNames.includes(value)) {
				return { message: this.translateService.instant('msg.script-name-exist') };
			}
			return null;
		};
	}
}

export interface ScriptModeType {
	name: string;
	mode: ScriptMode;
	newScript?: boolean;
}
