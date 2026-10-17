import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef as MatDialogRef } from '@angular/material/dialog';

import { DaterangepickerComponent } from '../daterangepicker';
import { IDateRange } from '../../_models/hmi';
import { DaterangepickerComponent as DaterangepickerComponent_1 } from '../daterangepicker/daterangepicker.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
    selector: 'app-daterange-dialog',
    templateUrl: './daterange-dialog.component.html',
    styleUrls: ['./daterange-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DaterangepickerComponent_1, MatButton, TranslatePipe]
})
export class DaterangeDialogComponent {

    @ViewChild('dtrange', {static: false}) public dtrange: DaterangepickerComponent;

    options = { };

    constructor(public dialogRef: MatDialogRef<DaterangeDialogComponent>) { }

    onOkClick() {
        let dateRange = <IDateRange> { start: this.dtrange.startDate.toDate().getTime(),
            end: this.dtrange.endDate.toDate().getTime() };
        this.dialogRef.close(dateRange);
    }

    onNoClick() {
        this.dialogRef.close();
    }
}
