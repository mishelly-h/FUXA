import { Component, AfterViewInit, ElementRef, inject, viewChild } from '@angular/core';

import { UntypedFormControl } from '@angular/forms';
import { MatTable as MatTable, MatTableDataSource as MatTableDataSource } from '@angular/material/table';
import { MatPaginator as MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { DiagnoseService } from '../_services/diagnose.service';
import { AppService } from '../_services/app.service';
import { LogsRequest } from '../_models/diagnose';

@Component({
    selector: 'app-logs-view',
    templateUrl: './logs-view.component.html',
    styleUrls: ['./logs-view.component.css'],
    standalone: false
})
export class LogsViewComponent implements AfterViewInit {
    private diagnoseService = inject(DiagnoseService);
    private appService = inject(AppService);


    readonly table = viewChild(MatTable);
    readonly sort = viewChild(MatSort);
    readonly paginator = viewChild(MatPaginator);
    readonly workPanel = viewChild<ElementRef>('workPanel');
    readonly textContent = viewChild<ElementRef>('textContent');

    dataSource = new MatTableDataSource([]);
    ontimeFilter = new UntypedFormControl();
    typeFilter = new UntypedFormControl();
    sourceFilter = new UntypedFormControl();
    textFilter = new UntypedFormControl();

    filteredValues = {
        ontime: '', source: '', type: '', text: ''
    };

    readonly displayColumns = ['ontime', 'type', 'source', 'text'];
    tableView = false;
    content = '';
    logs = { selected: 'fuxa.log', files: [] };

    ngAfterViewInit() {
        this.diagnoseService.getLogsDir().subscribe(result => {
            this.logs.files = result;
        }, err => {
            console.error('get Logs err: ' + err);
        });

        this.loadLogs(this.logs.selected);
    }

    loadLogs(logfile: string) {
        this.appService.showLoading(true);
        this.diagnoseService.getLogs(<LogsRequest>{ file: logfile }).subscribe(result => {
            this.content = result.body.replace(new RegExp('\n', 'g'), '<br />');
            this.appService.showLoading(false);
        }, err => {
            this.appService.showLoading(false);
            console.error('get Logs err: ' + err);
        });
    }

    scrollToTop() {
        const workPanel = this.workPanel();
        const textContent = this.textContent();
        if (this.tableView && workPanel) {
            workPanel.nativeElement.scrollTop = 0;
        } else if (!this.tableView && textContent) {
            textContent.nativeElement.scrollTop = 0;
        }
    }

    scrollToBottom() {
        const workPanel = this.workPanel();
        const textContent = this.textContent();
        if (this.tableView && workPanel) {
            workPanel.nativeElement.scrollTop = workPanel.nativeElement.scrollHeight;
        } else if (!this.tableView && textContent) {
            textContent.nativeElement.scrollTop = textContent.nativeElement.scrollHeight;
        }
    }
}
