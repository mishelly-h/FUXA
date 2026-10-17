import { Component, EventEmitter, OnInit, Inject, Output, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Device, AdsClientTagType, Tag } from '../../../_models/device';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../../_helpers/utils';

@Component({
    selector: 'app-tag-property-edit-adsclient',
    templateUrl: './tag-property-edit-adsclient.component.html',
    styleUrls: ['./tag-property-edit-adsclient.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, MatDialogActions, MatButton, TranslatePipe, EnumToArrayPipe]
})
export class TagPropertyEditADSclientComponent implements OnInit, OnDestroy {
    @Output() result = new EventEmitter<any>();
    formGroup: UntypedFormGroup;
    tagType = AdsClientTagType;
    existingNames = [];
    error: string;
    private destroy$ = new Subject<void>();

    constructor(private fb: UntypedFormBuilder,
        private translateService: TranslateService,
        public dialogRef: MatDialogRef<TagPropertyEditADSclientComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TagProperty) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            deviceName: [this.data.device.name, Validators.required],
            tagName: [this.data.tag.name, [Validators.required, this.validateName()]],
            tagType: [this.data.tag.type, Validators.required],
            tagAddress: [this.data.tag.address, Validators.required],
            tagDescription: [this.data.tag.description],
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

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    validateName(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            this.error = null;
            if (this.existingNames.indexOf(control.value) !== -1) {
                return { name: this.translateService.instant('msg.device-tag-exist') };
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

interface TagProperty {
    device: Device;
    tag: Tag;
}
