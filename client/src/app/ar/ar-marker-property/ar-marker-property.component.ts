import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AR_MARKER_PREFIX, ArMarker } from '../../_models/ar';
import { Utils } from '../../_helpers/utils';
import { View } from '../../_models/hmi';
import { ProjectService } from '../../_services/project.service';
import { createQrSvgDataUrl } from './qr-code-generator';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';

export interface ArMarkerPropertyData {
    marker?: ArMarker;
    markerIds: string[];
}

@Component({
    selector: 'app-ar-marker-property',
    templateUrl: './ar-marker-property.component.html',
    styleUrls: ['./ar-marker-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatIconButton, MatTooltip, MatSelect, MatOption, MatDialogActions, MatButton, TranslatePipe]
})
export class ArMarkerPropertyComponent implements OnInit, OnDestroy {
    formGroup: UntypedFormGroup;
    marker: ArMarker;
    views: View[] = [];
    qrDataUrl = '';
    qrError = '';
    private formSubscription: Subscription;
    private hmiLoadSubscription: Subscription;

    constructor(
        public dialogRef: MatDialogRef<ArMarkerPropertyComponent>,
        private fb: UntypedFormBuilder,
        private translateService: TranslateService,
        private projectService: ProjectService,
        @Inject(MAT_DIALOG_DATA) public data: ArMarkerPropertyData
    ) {
        this.marker = data?.marker ? { ...data.marker } : {
            id: this.createMarkerId(),
            label: '',
            viewId: '',
            ttlMs: 3000
        };
    }

    ngOnInit() {
        this.loadViews();
        this.formGroup = this.fb.group({
            id: [this.marker.id, [Validators.required, this.isValidMarkerId()]],
            label: [this.marker.label],
            viewId: [this.marker.viewId, Validators.required],
            ttlMs: [this.marker.ttlMs || 3000, [Validators.required, Validators.min(500)]]
        });
        this.formSubscription = this.formGroup.get('id').valueChanges.subscribe(value => this.updateQrPreview(value));
        this.hmiLoadSubscription = this.projectService.onLoadHmi.subscribe(() => this.loadViews());
        this.updateQrPreview(this.formGroup.get('id').value);
    }

    ngOnDestroy() {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.hmiLoadSubscription) {
            this.hmiLoadSubscription.unsubscribe();
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        const rawValue = this.formGroup.getRawValue();
        const marker = {
            ...this.marker,
            ...rawValue,
            ttlMs: Number(rawValue.ttlMs) || 3000
        };
        this.dialogRef.close(marker);
    }

    private isValidMarkerId(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.marker?.id === control.value) {
                return null;
            }
            if (this.data?.markerIds?.includes(control.value)) {
                return { markerId: this.translateService.instant('msg.ar-marker-id-exist') };
            }
            return null;
        };
    }

    onGenerateMarkerId() {
        this.formGroup.get('id').setValue(this.createMarkerId());
    }

    private updateQrPreview(markerId: string) {
        this.qrError = '';
        try {
            this.qrDataUrl = createQrSvgDataUrl(markerId || ' ');
        } catch (err) {
            this.qrDataUrl = '';
            this.qrError = String(err);
        }
    }

    private loadViews() {
        this.views = this.projectService.getViews() || [];
    }

    private createMarkerId(): string {
        let markerId = '';
        do {
            markerId = Utils.getShortGUID(AR_MARKER_PREFIX, '');
        } while (this.data?.markerIds?.includes(markerId));
        return markerId;
    }
}
