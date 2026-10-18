import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Device } from '../../_models/device';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexVariableComponent } from '../../gauges/gauge-property/flex-variable/flex-variable.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-tags-ids-config',
    templateUrl: './tags-ids-config.component.html',
    styleUrls: ['./tags-ids-config.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, FlexVariableComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class TagsIdsConfigComponent {
    dialogRef = inject<MatDialogRef<TagsIdsConfigComponent>>(MatDialogRef);
    data = inject<TagsIdsData>(MAT_DIALOG_DATA);


    onOkClick(): void {
        this.dialogRef.close(this.data.tagsIds);
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    setVariable(tagIdRef: TagIdRef, event) {
        tagIdRef.destId = event.variableId;
    }
}

export interface TagsIdsData{
    devices: Device[];
    tagsIds: TagIdRef[];
}

export interface TagIdRef {
    srcId: string;
    destId: string;
}
