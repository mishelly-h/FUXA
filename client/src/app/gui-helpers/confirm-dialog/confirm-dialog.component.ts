import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css'],
    standalone: false
})
export class ConfirmDialogComponent {
    dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
    data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);


    msgToConfirm = '';

    constructor() {

        this.msgToConfirm = this.data.msg;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(true);
    }
}

export interface ConfirmDialogData {
    msg: string;
    hideCancel?: boolean;
    backgroundColor?: string;
    color?: string;
}
