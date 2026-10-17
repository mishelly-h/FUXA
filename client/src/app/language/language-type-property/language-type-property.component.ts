import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Language, Languages } from '../../_models/language';
import { AbstractControl, FormArray, FormGroup, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ProjectService } from '../../_services/project.service';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-language-type-property',
    templateUrl: './language-type-property.component.html',
    styleUrls: ['./language-type-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, CdkScrollable, MatDialogContent, MatIconButton, MatTooltip, MatIcon, MatInput, MatDialogActions, MatButton, TranslatePipe]
})
export class LanguageTypePropertyComponent implements OnInit {

    languagesForm: UntypedFormGroup;

    constructor(
        public dialogRef: MatDialogRef<LanguageTypePropertyComponent>,
        private fb: UntypedFormBuilder,
        private projectService: ProjectService) {
    }

    ngOnInit(): void {
        const languages = this.projectService.getLanguages();
        this.languagesForm = this.fb.group({
            languages: this.fb.array([], this.uniqueLanguageIdValidator),
            defaultId: [languages.default?.id || 'EN', [Validators.required, Validators.pattern('^[A-Za-z]{2}$')]],
            defaultName: [languages.default?.name || 'English', Validators.required]
        });

        this.setLanguages(languages.options);
    }

    get languages(): FormArray {
        return this.languagesForm?.get('languages') as FormArray || new FormArray([]);
    }

    setLanguages(langs: Language[]): void {
        const languagesArray = this.languagesForm.get('languages') as FormArray;
        langs.forEach(lang => {
            languagesArray.push(this.createLanguageForm(lang));
        });
    }

    createLanguageForm(lang?: Language): FormGroup {
        return this.fb.group({
            id: [lang?.id || '', [Validators.required, Validators.pattern('^[A-Za-z]{2}$')]],
            name: [lang?.name || '', Validators.required]
        });
    }

    uniqueLanguageIdValidator(control: AbstractControl): ValidationErrors | null {
        const formArray = control as FormArray;
        const ids = formArray.controls.map(group => group.get('id')?.value?.toLowerCase());
        const hasDuplicates = ids.some((id, index) => id && ids.indexOf(id) !== index);
        return hasDuplicates ? { duplicateId: true } : null;
    }

    onAddLanguage(): void {
        this.languages.push(this.createLanguageForm());
    }

    onRemoveLanguage(index: number): void {
        this.languages.removeAt(index);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(<Languages> {
            options: <Language[]>this.languagesForm.getRawValue().languages,
            default: {
                id: this.languagesForm.get('defaultId').value,
                name: this.languagesForm.get('defaultName').value
            }
        });
    }
}
