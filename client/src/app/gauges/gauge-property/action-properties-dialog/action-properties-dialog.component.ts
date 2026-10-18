import { Component, OnInit, inject, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ProjectService } from '../../../_services/project.service';
import { Device } from '../../../_models/device';
import { GaugeProperty } from '../../../_models/hmi';
import { FlexActionComponent } from '../flex-action/flex-action.component';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-action-properties-dialog',
    templateUrl: './action-properties-dialog.component.html',
    styleUrls: ['./action-properties-dialog.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, MatIconButton, CdkScrollable, MatDialogContent, FlexActionComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class ActionPropertiesDialogComponent implements OnInit {
    private projectService = inject(ProjectService);
    dialogRef = inject<MatDialogRef<ActionPropertiesDialogComponent>>(MatDialogRef);
    data = inject<ActionPropertiesData>(MAT_DIALOG_DATA);


    readonly flexAction = viewChild<FlexActionComponent>('flexaction');
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
        this.data.property.actions = this.flexAction().getActions();
        this.dialogRef.close(this.data);
    }

    onAddAction() {
        this.flexAction().onAddAction();
    }
}

export interface ActionPropertiesData {
    devices?: Device[];
    withActions: any;
    property: GaugeProperty;
}

