import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTable as MatTable, MatTableDataSource as MatTableDataSource, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { ProjectService } from '../../_services/project.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NotificationPropertyComponent, NotificationPropertyData } from '../notification-property/notification-property.component';
import { Notification, NotificationsType } from '../../_models/notification';
import { AlarmsType } from '../../_models/alarm';
import { ConfirmDialogComponent } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatIconButton, MatFabButton } from '@angular/material/button';

@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html',
    styleUrls: ['./notification-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, NgClass, MatIconButton, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFabButton, TranslatePipe]
})
export class NotificationListComponent implements OnInit, AfterViewInit, OnDestroy {

    displayedColumns = ['select', 'name', 'receiver', 'delay', 'interval', 'type', 'enabled', 'subscriptions', 'remove'];
    dataSource = new MatTableDataSource([]);

    notificationAlarm = Object.keys(NotificationsType).find(key => NotificationsType[key] === NotificationsType.alarms);
    notificationTrigger = Object.keys(NotificationsType).find(key => NotificationsType[key] === NotificationsType.trigger);
    alarmsType = {};
    alarmsEnum = AlarmsType;

    private destroy$ = new Subject<void>();

    @ViewChild(MatTable, {static: true}) table: MatTable<any>;
    @ViewChild(MatSort, {static: false}) sort: MatSort;

    constructor(public dialog: MatDialog,
        private translateService: TranslateService,
        private projectService: ProjectService) { }

    ngOnInit() {
        this.loadNotifications();
        this.projectService.onLoadHmi.pipe(
            takeUntil(this.destroy$)
        ).subscribe(res => {
            this.loadNotifications();
        });
        Object.values(this.alarmsEnum).forEach(key => {
            this.alarmsType[key] = this.translateService.instant('alarm.property-' + key);
        });
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy() {
        this.destroy$.next(null);
        this.destroy$.complete();
    }

    onAddNotification() {
		this.editNotification();
    }

    onEditNotification(notification: Notification) {
		this.editNotification(notification);
    }

    onRemoveNotification(notification: Notification) {
        let msg = this.translateService.instant('msg.notification-remove', { value: notification.name });
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { msg: msg },
            position: { top: '60px' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.projectService.removeNotification(notification).subscribe(() => {
                    this.loadNotifications();
                });
            }
        });
    }

    editNotification(notification?: Notification) {
        let dialogRef = this.dialog.open(NotificationPropertyComponent, {
            disableClose: true,
            data: <NotificationPropertyData> {
                notification: notification,
            },
            position: { top: '80px' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.projectService.setNotification(result, notification).subscribe(() => {
                    this.loadNotifications();
                });
            }
        });
    }

    getSubProperty(notification: Notification) {
        if (notification) {
            if (notification.type === this.notificationAlarm) {
                let result = '';
                Object.keys(notification.subscriptions ?? []).forEach(key => {
                    if (notification.subscriptions[key]) {
                        if (result) {result += ', ';}
                        result += this.alarmsType[key];
                    }
                });
                return result;
            }
        }
        return '';
    }

    private loadNotifications() {
        this.dataSource.data = this.projectService.getNotifications();
	}
}
