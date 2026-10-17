import { Component, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { ResourceGroup, Resources, ResourceType } from '../../_models/resources';
import { ResourcesService } from '../../_services/resources.service';
import { EndPointApi } from '../../_helpers/endpointapi';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-lib-images',
    templateUrl: './lib-images.component.html',
    styleUrls: ['./lib-images.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatTooltip, MatDialogActions, MatButton, TranslatePipe]
})
export class LibImagesComponent implements AfterViewInit, OnDestroy {
    private endPointConfig: string = EndPointApi.getURL();
    resImages?: ResourceGroup[];
    subscription: Subscription;

    constructor(
        private dialogRef: MatDialogRef<LibImagesComponent>,
        private resourcesService: ResourcesService) { }

    ngAfterViewInit() {
        this.loadResources();
    }

    ngOnDestroy() {
        try {
            this.subscription.unsubscribe();
        } catch (err) {
            console.error(err);
        }
    }

    loadResources() {
        this.subscription = this.resourcesService.getResources(ResourceType.images).subscribe((result: Resources) => {
            const groups = result?.groups || [];
            groups.forEach(group => {
                group.items.forEach(item => {
                    item.path = `${this.endPointConfig}/${item.path}`;
                });
            });
            this.resImages = groups;
        }, err => {
            console.error('get Resources images error: ' + err);
        });
    }

    onSelect(imgPath: string) {
        this.dialogRef.close(imgPath);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    isVideo(path: string): boolean {
        return this.resourcesService.isVideo(path);
    }
}
