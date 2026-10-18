import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ReportItemText } from '../../../_models/report';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-report-item-text',
    templateUrl: './report-item-text.component.html',
    styleUrls: ['./report-item-text.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatInput, FormsModule, MatDialogActions, MatButton, TranslatePipe]
})
export class ReportItemTextComponent {
    dialogRef = inject<MatDialogRef<ReportItemTextComponent>>(MatDialogRef);
    data = inject<ReportItemText>(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.data);
    }
}
