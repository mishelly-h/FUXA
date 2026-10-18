import { Component, inject, viewChild } from '@angular/core';
import { MatDialogRef as MatDialogRef } from '@angular/material/dialog';

import { DaterangepickerComponent } from '../daterangepicker';
import { IDateRange } from '../../_models/hmi';
@Component({
    selector: 'app-daterange-dialog',
    templateUrl: './daterange-dialog.component.html',
    styleUrls: ['./daterange-dialog.component.css'],
    standalone: false
})
export class DaterangeDialogComponent {
    dialogRef = inject<MatDialogRef<DaterangeDialogComponent>>(MatDialogRef);


    public readonly dtrange = viewChild<DaterangepickerComponent>('dtrange');

    options = { };

    onOkClick() {
        let dateRange = <IDateRange> { start: this.dtrange().startDate.toDate().getTime(),
            end: this.dtrange().endDate.toDate().getTime() };
        this.dialogRef.close(dateRange);
    }

    onNoClick() {
        this.dialogRef.close();
    }
}
