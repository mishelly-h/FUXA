import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../../../_services/project.service';
import { Device } from '../../../_models/device';
import { GaugeProperty } from '../../../_models/hmi';
import { FlexActionComponent } from '../flex-action/flex-action.component';

@Component({
    selector: 'app-action-properties-dialog',
    templateUrl: './action-properties-dialog.component.html',
    styleUrls: ['./action-properties-dialog.component.scss'],
    standalone: false
})
export class ActionPropertiesDialogComponent implements OnInit {
    private projectService = inject(ProjectService);
    dialogRef = inject<MatDialogRef<ActionPropertiesDialogComponent>>(MatDialogRef);
    data = inject<ActionPropertiesData>(MAT_DIALOG_DATA);


    @ViewChild('flexaction', {static: false}) flexAction: FlexActionComponent;
    property: GaugeProperty;

    ngOnInit() {
        if (!this.data.devices) {
            this.data.devices = Object.values(this.projectService.getDevices());
        }
        this.property = this.data.property;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.property.actions = this.flexAction.getActions();
        this.dialogRef.close(this.data);
    }

    onAddAction() {
        this.flexAction.onAddAction();
    }
}

export interface ActionPropertiesData {
    devices?: Device[];
    withActions: any;
    property: GaugeProperty;
}

