import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-bitmask',
    templateUrl: './bitmask.component.html',
    styleUrls: ['./bitmask.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelectionList, FormsModule, MatListOption, MatDialogActions, MatButton, TranslatePipe]
})
export class BitmaskComponent implements OnInit {
    dialogRef = inject<MatDialogRef<BitmaskComponent>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);


    size = 32;
    bits: Bit[] = [];
    selected: Bit[] = [];

    ngOnInit() {
        this.size = this.data.size || 32;
        for (let i = 0; i < this.size; i++) {
            let bit = <Bit>{id: Math.pow(2, i), label: (i).toString()};
            this.bits.push(bit);
            if (this.data.bitmask & bit.id) {
                this.selected.push(bit);
            }
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        let result = { bitmask: this.getValue() };
        this.dialogRef.close(result);
    }

    getValue(): number {
        let result = 0;
        for (let i = 0; i < this.selected.length; i++) {
            result += this.selected[i].id;
        }
        return result;
    }
}

export class Bit {
    public id: number;
    public label: string;
    public selected: boolean;
}
