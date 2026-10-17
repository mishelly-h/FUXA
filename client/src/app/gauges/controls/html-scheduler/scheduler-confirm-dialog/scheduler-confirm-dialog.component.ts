import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TranslatePipe]
})
export class SchedulerConfirmDialogComponent {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SchedulerConfirmDialogData,
        private dialogRef: MatDialogRef<SchedulerConfirmDialogComponent>
    ) { }

    onCancel(): void { this.dialogRef.close(false); }
    onConfirm(): void { this.dialogRef.close(true); }
}
