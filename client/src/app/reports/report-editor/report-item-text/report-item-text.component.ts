import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportItemText } from '../../../_models/report';

@Component({
    selector: 'app-report-item-text',
    templateUrl: './report-item-text.component.html',
    styleUrls: ['./report-item-text.component.css'],
    standalone: false
})
export class ReportItemTextComponent {
    dialogRef = inject<MatDialogRef<ReportItemTextComponent>>(MatDialogRef);
    data = inject<ReportItemText>(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.data);
    }
}
