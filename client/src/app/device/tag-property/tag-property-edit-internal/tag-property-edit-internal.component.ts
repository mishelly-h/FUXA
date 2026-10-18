import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Device, ServerTagType, Tag } from '../../../_models/device';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { NumberOnlyDirective } from '../../../_directives/number.directive';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../../_helpers/utils';

@Component({
    selector: 'app-tag-property-edit-internal',
    templateUrl: './tag-property-edit-internal.component.html',
    styleUrls: ['./tag-property-edit-internal.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, NumberOnlyDirective, MatDialogActions, MatButton, TranslatePipe, EnumToArrayPipe]
})
export class TagPropertyEditInternalComponent implements OnInit {
    private fb = inject(UntypedFormBuilder);
    private translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<TagPropertyEditInternalComponent>>(MatDialogRef);
    data = inject<TagPropertyInternalData>(MAT_DIALOG_DATA);

    @Output() result = new EventEmitter<any>();
    formGroup: UntypedFormGroup;
    tagType = ServerTagType;
    existingNames = [];
    error: string;

    ngOnInit() {
        this.formGroup = this.fb.group({
            deviceName: [this.data.device.name, Validators.required],
            tagName: [this.data.tag.name, [Validators.required, this.validateName()]],
            tagType: [this.data.tag.type],
            tagInit: [this.data.tag.init],
            tagDescription: [this.data.tag.description]
        });
        this.formGroup.updateValueAndValidity();
        Object.keys(this.data.device.tags).forEach((key) => {
            let tag = this.data.device.tags[key];
            if (tag.id) {
                if (tag.id !== this.data.tag.id) {
                    this.existingNames.push(tag.name);
                }
            } else if (tag.name !== this.data.tag.name) {
                this.existingNames.push(tag.name);
            }
        });
    }

    validateName(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            this.error = null;
            const name = control?.value;
            if (this.existingNames.indexOf(name) !== -1) {
              return { name: this.translateService.instant('msg.device-tag-exist') };
            }
            if (name?.includes('@')) {
              return { name: this.translateService.instant('msg.device-tag-invalid-char') };
            }
            return null;
        };
    }

    onNoClick(): void {
        this.result.emit();
    }

    onOkClick(): void {
        this.result.emit(this.formGroup.getRawValue());
    }
}

export interface TagPropertyInternalData {
    device: Device;
    tag: Tag;
}
