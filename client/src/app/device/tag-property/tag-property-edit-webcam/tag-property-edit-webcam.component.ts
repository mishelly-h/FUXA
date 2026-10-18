import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Device, ServerTagType, Tag } from '../../../_models/device';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NumberOnlyDirective } from '../../../_directives/number.directive';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../../_helpers/utils';

@Component({
    selector: 'app-tag-property-edit-internal',
    templateUrl: './tag-property-edit-webcam.component.html',
    styleUrls: ['./tag-property-edit-webcam.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, NumberOnlyDirective, MatSelect, MatOption, MatDialogActions, MatButton, TranslatePipe, EnumToArrayPipe]
})
export class TagPropertyEditWebcamComponent implements OnInit {
    private fb = inject(UntypedFormBuilder);
    private translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<TagPropertyEditWebcamComponent>>(MatDialogRef);
    data = inject<TagPropertyWebcamData>(MAT_DIALOG_DATA);

    @Output() result = new EventEmitter<any>();
    formGroup: UntypedFormGroup;
    readonly tagType = ServerTagType;
    readonly outputType = OutputType;
    readonly callbackReturnType = WebcamCallbackReturnType;
    existingNames = [];
    error: string;

    ngOnInit() {
        this.formGroup = this.fb.group({
            deviceName: [this.data.device.name, Validators.required],
            tagName: [this.data.tag.name, [Validators.required, this.validateName()]],
            tagAddress: [this.data.tag.address],
            tagType: [this.data.tag.type],
            tagInit: [this.data.tag.init],
            tagDescription: [this.data.tag.description],
            tagOptions: this.fb.group({
                    width: this.data.tag.options?.width || 1280,
                    height:this.data.tag.options?.height ||  720,
                    frames:this.data.tag.options?.frames || 60,
                    quality: this.data.tag.options?.quality || 100,
                    output: this.data.tag.options?.output || OutputType.jpeg,
                    callbackReturn: this.data.tag.options?.callbackReturn || WebcamCallbackReturnType.location
            }),
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

export interface TagPropertyWebcamData {
    device: Device;
    tag: Tag;
}


export enum WebcamCallbackReturnType {
    location = 'location',
    // buffer = 'buffer', not support now
    base64 ='base64'
}

export enum OutputType {
    jpeg = 'jpeg',
    png = 'png',
}
