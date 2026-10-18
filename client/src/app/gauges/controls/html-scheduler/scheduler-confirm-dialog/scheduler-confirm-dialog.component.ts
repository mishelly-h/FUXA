import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface SchedulerConfirmDialogData {
    title: string;
    message: string;         // can be plain text or HTML
    confirmText?: string;    // default: 'OK'
    showCancel?: boolean;    // default: true
    icon?: string;           // material icon name
}

@Component({
    selector: 'app-scheduler-confirm-dialog.component',
    templateUrl: './scheduler-confirm-dialog.component.html',
    styleUrls: ['./scheduler-confirm-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [TranslatePipe]
})
export class SchedulerConfirmDialogComponent {
    data = inject<SchedulerConfirmDialogData>(MAT_DIALOG_DATA);
    private dialogRef = inject<MatDialogRef<SchedulerConfirmDialogComponent>>(MatDialogRef);


    onCancel(): void { this.dialogRef.close(false); }
    onConfirm(): void { this.dialogRef.close(true); }
}
