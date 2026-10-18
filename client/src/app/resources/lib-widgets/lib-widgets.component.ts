import { Component, ElementRef, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ResourceGroup, ResourceItem } from '../../_models/resources';
import { LibWidgetsService } from './lib-widgets.service';
import { RcgiService } from '../../_services/rcgi/rcgi.service';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ToastNotifierService } from '../../_services/toast-notifier.service';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-lib-widgets',
    templateUrl: './lib-widgets.component.html',
    styleUrls: ['./lib-widgets.component.scss'],
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelContent, MatTooltip, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, AsyncPipe, TranslatePipe]
})
export class LibWidgetsComponent implements OnInit, OnDestroy {
    private libWidgetService = inject(LibWidgetsService);
    private toastNotifier = inject(ToastNotifierService);
    private rcgiService = inject(RcgiService);


    resourceWidgets$: Observable<ResourceGroup[]>;
    selectedWidgetPath: string;
    private destroy$ = new Subject<void>();
    rootPath = '';
    contextMenuWidget: any = null;
    expandedGroups: { [groupName: string]: boolean } = {};

    readonly menuTrigger = viewChild.required<MatMenuTrigger>('menuTriggerButton');
    readonly triggerButtonRef = viewChild.required('menuTriggerEl', { read: ElementRef });

    constructor() {
            this.rootPath = this.rcgiService.rcgi.endPointConfig;
        }

    ngOnInit() {
        this.resourceWidgets$ = this.libWidgetService.resourceWidgets$;
        this.libWidgetService.clearSelection$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.clearSelection();
        });
    }

    ngOnDestroy() {
        this.destroy$.next(null);
        this.destroy$.complete();
    }

    onSelect(widgetPath: string) {
        this.selectedWidgetPath = widgetPath;
        this.libWidgetService.widgetSelected(`${this.rootPath}/${widgetPath}`);
    }

    clearSelection() {
        this.selectedWidgetPath = null;
    }

    onRemoveWidget(widget: ResourceItem) {
        this.libWidgetService.removeWidget(widget).subscribe(() => {
            this.libWidgetService.refreshResources();
         }, err => {
            console.error('Remove failed:', err);
            this.toastNotifier.notifyError('msg.file-download-failed', err.message || err);
        });
    }
}
