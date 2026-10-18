import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Device, GpioDirectionType, GpioEdgeType, Tag} from '../../../_models/device';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../../_helpers/utils';

@Component({
    selector: 'app-tag-property-edit-gpio',
    templateUrl: './tag-property-edit-gpio.component.html',
    styleUrls: ['./tag-property-edit-gpio.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, MatDialogActions, MatButton, TranslatePipe, EnumToArrayPipe]
})
export class TagPropertyEditGpioComponent implements OnInit {
    private fb = inject(UntypedFormBuilder);
    private translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<TagPropertyEditGpioComponent>>(MatDialogRef);
    data = inject<TagPropertyGpioData>(MAT_DIALOG_DATA);

    @Output() result = new EventEmitter<any>();
    formGroup: UntypedFormGroup;
    directionType = GpioDirectionType;
    edgeType = GpioEdgeType;
    existingNames = [];
    error: string;

    ngOnInit() {
        this.formGroup = this.fb.group({
            deviceName: [this.data.device.name, Validators.required],
            tagName: [this.data.tag.name, [Validators.required, this.validateName()]],
            tagAddress: [this.data.tag.address, [Validators.required]],
            tagDescription: [this.data.tag.description],
            tagDirection: [this.data.tag.direction, Validators.required],
            tagEdge: [this.data.tag.edge],
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

    protected readonly GpioDirectionType = GpioDirectionType;
}

export interface TagPropertyGpioData {
    device: Device;
    tag: Tag;
}
