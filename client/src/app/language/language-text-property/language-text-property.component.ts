import { Component, OnInit, inject } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../../_services/project.service';
import { Language, LanguageText } from '../../_models/language';

@Component({
    selector: 'app-language-text-property',
    templateUrl: './language-text-property.component.html',
    styleUrls: ['./language-text-property.component.scss'],
    standalone: false
})
export class LanguageTextPropertyComponent implements OnInit {
    dialogRef = inject<MatDialogRef<LanguageTextPropertyComponent>>(MatDialogRef);
    private fb = inject(UntypedFormBuilder);
    private projectService = inject(ProjectService);
    data = inject<LanguageTextPropertyData>(MAT_DIALOG_DATA);


    formGroup: UntypedFormGroup;
    languages: Language[] = [];
    defaultLanguage: Language;
    nameExists: boolean = false;

    ngOnInit() {
        let controls = {
            name: new FormControl(this.data.text?.name || '', [
                Validators.required,
                Validators.pattern(/^[a-zA-Z0-9_]+$/)
            ]),
            group: new FormControl(this.data.text?.group || ''),
            value: new FormControl(this.data.text?.value || ''),
        };
        this.languages = this.projectService.getLanguages().options || [];
        this.defaultLanguage = this.projectService.getLanguages().default;
        this.languages.forEach(lang => {
            controls[`translation_${lang.id}`] = new FormControl(this.data.text?.translations?.[lang.id] || '');
        });
        this.formGroup = this.fb.group(controls);
    }

    checkNameExists() {
        const name = this.formGroup?.get('name')?.value;
        this.nameExists = this.projectService.getTexts()?.find(text => text.name === name && text.id !== this.data.text.id) ? true : false;
        return this.nameExists ? { nameTaken: true } : null;
    }

    clearNameError() {
        this.nameExists = false;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.formGroup.valid) {
            const updatedText: LanguageText = {
                ...this.data.text,
                name: this.formGroup.value.name,
                group: this.formGroup.value.group,
                value: this.formGroup.value.value,
                translations: this.languages.reduce((acc, lang) => {
                    acc[lang.id] = this.formGroup.value[`translation_${lang.id}`];
                    return acc;
                }, {})
            };
            this.dialogRef.close(updatedText);
        }
    }
}

export interface LanguageTextPropertyData {
    text: LanguageText;
}
