import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialog as MatDialog, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { ReportColumns, ReportsFilter } from '../../../../_models/report';
import { TableFilter, TableType } from '../../../../_models/hmi';
import { ProjectService } from '../../../../_services/project.service';

@Component({
    selector: 'app-table-reports',
    templateUrl: './table-reports.component.html',
    styleUrls: ['./table-reports.component.scss'],
    standalone: false
})
export class TableReportsComponent {
    private dialog = inject(MatDialog);
    private projectService = inject(ProjectService);
    dialogRef = inject<MatDialogRef<TableReportsComponent>>(MatDialogRef);
    data = inject<TableReportsType>(MAT_DIALOG_DATA);


    reportsColumns = ReportColumns;
    reportsFilter: ReportsFilter = {
        name: '',
        count: ''
    };

    constructor() {
            this.reportsFilter.name = this.data.filter?.filterA[0];
            this.reportsFilter.count = this.data.filter?.filterA[1];
    }


    onReportColumChanged(clnId: string, selected: boolean) {
        let indexToRemove = this.data.columns.indexOf(clnId);
        if (selected) {
            if (indexToRemove === -1) {
                this.data.columns.push(clnId);
            }
        } else {
            this.data.columns.splice(indexToRemove, 1);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.filter = {
            filterA: [this.reportsFilter.name, this.reportsFilter.count],
        };
        this.dialogRef.close(this.data);
    }
}

export interface TableReportsType {
    columns: string[];
    filter: TableFilter;
    type: TableType;
}
