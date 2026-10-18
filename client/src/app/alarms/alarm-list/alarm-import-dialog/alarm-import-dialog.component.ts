import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type AlarmImportMode = 'replace' | 'copy';

export interface AlarmImportDialogData {
    total: number;
    conflicts: number;
}

@Component({
    selector: 'app-alarm-import-dialog',
    templateUrl: './alarm-import-dialog.component.html',
    styleUrls: ['./alarm-import-dialog.component.scss'],
    standalone: false
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
