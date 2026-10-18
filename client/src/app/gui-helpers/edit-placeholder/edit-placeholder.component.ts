import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-edit-placeholder',
    templateUrl: './edit-placeholder.component.html',
    styleUrls: ['./edit-placeholder.component.scss'],
    standalone: false
})
export class EditPlaceholderComponent implements OnInit {
    dialogRef = inject<MatDialogRef<EditPlaceholderComponent>>(MatDialogRef);
    private fb = inject(UntypedFormBuilder);
    data = inject(MAT_DIALOG_DATA);


    formGroup: UntypedFormGroup;

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

