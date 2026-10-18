import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-edit-name',
    templateUrl: './edit-name.component.html',
    styleUrls: ['./edit-name.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, FormsModule, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class EditNameComponent {
    dialogRef = inject<MatDialogRef<EditNameComponent>>(MatDialogRef);
    data = inject<EditNameData>(MAT_DIALOG_DATA);

    error = '';

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.data);
    }

    isValid(name: string): boolean {
        if (this.data.validator) {
            if (!this.data.validator(name)) {
                return false;
            }
        }
        if (this.data.exist && this.data.exist.length) {
            return (this.data.exist.find((n) => n === name)) ? false : true;
        }
        return true;
    }

    onCheckValue(input: any) {
        if (this.data.exist && this.data.exist.length && input.target.value) {
            if (this.data.exist.find((n) => n === input.target.value)) {
                this.error = this.data.error;
                return;
            }
        }
        this.error = '';
    }
}

export interface EditNameData {
    name: string;
    exist?: string[];
    label?: string;
    title?: string;
    error?: string;
    validator?: any;
}
