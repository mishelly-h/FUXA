import { Component, inject } from '@angular/core';
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
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, FormsModule, ColorPickerDirective, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class GraphSourceEditComponent {
    dialogRef = inject<MatDialogRef<GraphSourceEditComponent>>(MatDialogRef);
    data = inject<GraphSource>(MAT_DIALOG_DATA);

    defaultColor = Utils.defaultColor;
    chartAxesType = [1, 2, 3, 4];

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.data);
    }
}
