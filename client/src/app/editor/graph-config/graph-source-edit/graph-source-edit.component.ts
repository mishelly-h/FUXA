import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Utils } from '../../../_helpers/utils';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

import { GraphSource } from '../../../_models/graph';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { ColorPickerDirective } from 'ngx-color-picker';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-graph-source-edit',
    templateUrl: './graph-source-edit.component.html',
    styleUrls: ['./graph-source-edit.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, FormsModule, ColorPickerDirective, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class GraphSourceEditComponent {
    defaultColor = Utils.defaultColor;
    chartAxesType = [1, 2, 3, 4];

    constructor(
        public dialogRef: MatDialogRef<GraphSourceEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GraphSource) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.data);
    }
}
