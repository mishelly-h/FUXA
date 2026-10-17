import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ChartLine, ChartLineZone } from '../../../_models/chart';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { NumberOnlyDirective } from '../../../_directives/number.directive';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ColorPickerDirective } from 'ngx-color-picker';
import { MatIconButton, MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-chart-line-property',
    templateUrl: './chart-line-property.component.html',
    styleUrls: ['./chart-line-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, NumberOnlyDirective, MatSlideToggle, ColorPickerDirective, MatIconButton, MatDialogActions, MatButton, TranslatePipe]
})
export class ChartLinePropertyComponent implements OnInit {
    defaultColor = Utils.defaultColor;
    chartAxesType = [1, 2, 3, 4];
    formGroup: UntypedFormGroup;

    constructor(
        private fb: UntypedFormBuilder,
        public dialogRef: MatDialogRef<ChartLinePropertyComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChartLineAndInterpolationsType) {
    }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [{value: this.data.name, disabled: true }, Validators.required],
            label: [this.data.label, Validators.required],
            yaxis: [this.data.yaxis],
            lineInterpolation: [this.data.lineInterpolation],
            lineWidth: [this.data.lineWidth],
            spanGaps: [this.data.spanGaps]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close({...this.data, ...this.formGroup.getRawValue()});
    }

    onAddZone() {
        if (!this.data.zones) {
            this.data.zones = [];
        }
        this.data.zones.push(<ChartLineZone> {
            min: 0,
            max: 0,
            stroke: '#FF2525',
            fill: '#BFCDDB'
        });
    }

    onRemoveZone(index: number) {
        this.data.zones.splice(index, 1);
    }
}

export type ChartLineAndInterpolationsType = ChartLine & {
    lineInterpolationType: { text: string; value: any }[];
};
