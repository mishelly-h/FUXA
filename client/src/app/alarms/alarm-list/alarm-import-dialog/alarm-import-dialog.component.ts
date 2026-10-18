import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export type AlarmImportMode = 'replace' | 'copy';

export interface AlarmImportDialogData {
    total: number;
    conflicts: number;
}

@Component({
    selector: 'app-alarm-import-dialog',
    templateUrl: './alarm-import-dialog.component.html',
    styleUrls: ['./alarm-import-dialog.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, TranslatePipe]
})
export class AlarmImportDialogComponent {
    dialogRef = inject<MatDialogRef<AlarmImportDialogComponent>>(MatDialogRef);
    data = inject<AlarmImportDialogData>(MAT_DIALOG_DATA);


    onCancel() {
        this.dialogRef.close();
    }

    onReplace() {
        this.dialogRef.close(<AlarmImportMode>'replace');
    }

    onCopy() {
        this.dialogRef.close(<AlarmImportMode>'copy');
    }
}
