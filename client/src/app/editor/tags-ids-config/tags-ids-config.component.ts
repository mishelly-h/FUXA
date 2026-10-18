import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { Device } from '../../_models/device';

@Component({
    selector: 'app-tags-ids-config',
    templateUrl: './tags-ids-config.component.html',
    styleUrls: ['./tags-ids-config.component.scss'],
    standalone: false
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
