import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { HeaderItem, HeaderItemType } from '../../../_models/hmi';
import { ProjectService } from '../../../_services/project.service';
import { Utils } from '../../../_helpers/utils';
import { UploadFile } from '../../../_models/project';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { IconSelectorComponent } from '../../../framework/icon-selector/icon-selector.component';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { NumberOnlyDirective } from '../../../_directives/number.directive';
import { ColorPickerDirective } from 'ngx-color-picker';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-layout-header-item-property',
    templateUrl: './layout-header-item-property.component.html',
    styleUrls: ['./layout-header-item-property.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, IconSelectorComponent, MatSelect, FormsModule, MatOption, NumberOnlyDirective, ColorPickerDirective, MatDialogActions, MatButton, TranslatePipe]
})
export class LayoutHeaderItemPropertyComponent {
    projectService = inject(ProjectService);
    private cdr = inject(ChangeDetectorRef);
    dialogRef = inject<MatDialogRef<LayoutHeaderItemPropertyComponent>>(MatDialogRef);
    data = inject<HeaderItem>(MAT_DIALOG_DATA);

    item: HeaderItem;
    headerType = <HeaderItemType[]>['button', 'label', 'image'];
    defaultColor = Utils.defaultColor;

    constructor() {
        const data = this.data;


        this.item = data;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.item.height === null || this.item.height === undefined || `${this.item.height}` === '') {
            delete this.item.height;
        }
        this.dialogRef.close(this.item);
    }

    /**
     * add image to view
     * @param event selected file
     */
    onSetImage(event) {
        if (event.target.files) {
            let filename = event.target.files[0].name;
            let fileToUpload = { type: filename.split('.').pop().toLowerCase(), name: filename.split('/').pop(), data: null };
            let reader = new FileReader();
            reader.onload = () => {
                try {
                    fileToUpload.data = reader.result;
                    this.projectService.uploadFile(fileToUpload).subscribe((result: UploadFile) => {
                        this.item.image = result.location;
                        this.item.icon = 'image';
                        this.cdr.detectChanges();
                    });
                } catch (err) {
                    console.error(err);
                }
            };
            if (fileToUpload.type === 'svg') {
                reader.readAsText(event.target.files[0]);
            } else {
                reader.readAsDataURL(event.target.files[0]);
            }
        }
    }
}
