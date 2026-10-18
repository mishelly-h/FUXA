import { Component, inject } from '@angular/core';
import { ScriptParamType } from '../../../_models/script';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Utils } from '../../../_helpers/utils';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-script-editor-param',
    templateUrl: './script-editor-param.component.html',
    styleUrls: ['./script-editor-param.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, FormsModule, MatSelect, MatOption, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class ScriptEditorParamComponent {
    dialogRef = inject<MatDialogRef<ScriptEditorParamComponent>>(MatDialogRef);
    private translateService = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);

    error = '';
    existError: string;
    paramType = Utils.enumKeys(ScriptParamType);

    constructor() {

        this.existError = this.translateService.instant('script.param-name-exist');
    }

    onNoClick(): void {
        this.dialogRef.close();

    }

    isValid(name): boolean {
        if (this.data.validator && !this.data.validator(name)) { return false; }
        if (!this.data.type) { return false; }
        if (!this.data.name) { return false; }
        return (this.data.exist.find((n) => n === name)) ? false : true;
    }

    onCheckValue(input: any) {
        if (this.data.exist && this.data.exist.length && input.target.value) {
            if (this.data.exist.find((n) => n === input.target.value)) {
                this.error = this.existError;
                return;
            }
        }
        this.error = '';
    }
}
