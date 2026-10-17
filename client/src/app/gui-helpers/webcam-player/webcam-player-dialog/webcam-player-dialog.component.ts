import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { GaugesManager } from '../../../gauges/gauges.component';
import { GaugeSettings, View } from '../../../_models/hmi';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { WebcamPlayerComponent } from '../webcam-player.component';

@Component({
    selector: 'app-webcam-player-dialog',
    templateUrl: './webcam-player-dialog.component.html',
    styleUrls: ['./webcam-player-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DialogDraggableDirective, WebcamPlayerComponent]
})
export class WebcamPlayerDialogComponent {

    constructor(public dialogRef: MatDialogRef<WebcamPlayerDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: WebcamPlayerDialogData) {
    }

    onCloseDialog() {
        this.dialogRef.close();
    }
}

export interface WebcamPlayerDialogData {
    bkColor: string;
    gaugesManager: GaugesManager;
    view: View;
    ga: GaugeSettings;
}
