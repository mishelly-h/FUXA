import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Device } from '../../../_models/device';
import { HmiService } from '../../../_services/hmi.service';
import { ProjectService } from '../../../_services/project.service';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-device-webapi-property-dialog',
    templateUrl: './device-webapi-property-dialog.component.html',
    styleUrls: ['./device-webapi-property-dialog.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSlideToggle, FormsModule, MatDialogActions, MatButton, TranslatePipe]
})
export class DeviceWebapiPropertyDialogComponent implements OnInit, OnDestroy {
    private projectService = inject(ProjectService);
    private hmiService = inject(HmiService);
    private translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<DeviceWebapiPropertyDialogComponent>>(MatDialogRef);
    data = inject<IDataDevice>(MAT_DIALOG_DATA);


    private cacheDevice: Device;
	private subscriptionDeviceTagsRequest: Subscription;

    message = '';

    ngOnInit() {
        this.cacheDevice = JSON.parse(JSON.stringify(this.data.device));

        this.subscriptionDeviceTagsRequest = this.hmiService.onDeviceTagsRequest.subscribe(res => {
			if (res.result && res.result.tags) {
                this.translateService.get('msg.device-tags-request-result', { value: res.result.newTagsCount, current: res.result.tags.length }).subscribe((txt: string) => { this.message = txt; });
                if (res.result.newTagsCount) {
                    for (let i = 0; i < res.result.tags.length; i++) {
                        this.data.device.tags[res.result.tags[i][0].id] = res.result.tags[i][0];
                    }
                    this.projectService.setDevice(this.data.device, this.data.device, null);
                }
            }
		});
    }

    ngOnDestroy() {
		try {
			if (this.subscriptionDeviceTagsRequest) {
				this.subscriptionDeviceTagsRequest.unsubscribe();
			}
		} catch (err) {
            console.error(err);
		}
	}

    onNoClick(): void {
		this.dialogRef.close();
	}

    onOkClick(): void {
        if (this.cacheDevice.enabled !== this.data.device.enabled) {
            this.projectService.setDevice(this.data.device, this.data.device, null);
        }
		this.dialogRef.close();
    }

    onLoadTagsClick(): void {
        this.message = '';
		this.hmiService.askDeviceTags(this.data.device.id);
    }
}

export interface IDataDevice {
    device: Device;
}
