import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
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
