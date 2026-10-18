import { Component, OnInit, inject } from '@angular/core';
import { Hmi, View } from '../../_models/hmi';
import { GaugesManager } from '../../gauges/gauges.component';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../../_services/project.service';
import { FuxaViewComponent } from '../fuxa-view.component';

@Component({
    selector: 'app-fuxa-view-dialog',
    templateUrl: './fuxa-view-dialog.component.html',
    styleUrls: ['./fuxa-view-dialog.component.scss'],
    imports: [FuxaViewComponent]
})
export class FuxaViewDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<FuxaViewDialogComponent>>(MatDialogRef);
    private projectService = inject(ProjectService);
    data = inject<FuxaViewDialogData>(MAT_DIALOG_DATA);


    view: View;
    hmi: Hmi;
    gaugesManager: GaugesManager;
    variablesMapping = [];

    ngOnInit() {
        this.hmi = this.projectService.getHmi();
    }

    onCloseDialog() {
        this.dialogRef.close();
    }
}

export interface FuxaViewDialogData {
    disableDefaultClose: boolean;
    bkColor: string;
    gaugesManager: GaugesManager;
    view: View;
    variablesMapping: [];
    sourceDeviceId?: string;
}
