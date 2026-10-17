import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-edit-placeholder',
    templateUrl: './edit-placeholder.component.html',
    styleUrls: ['./edit-placeholder.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, TranslatePipe]
})
export class EditPlaceholderComponent implements OnInit {

    formGroup: UntypedFormGroup;

    constructor(
        public dialogRef: MatDialogRef<EditPlaceholderComponent>,
        private fb: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: ['', Validators.required],
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(this.formGroup.value.name);
    }
}

