import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { CardWidgetType, CardWidget, PropertyScaleModeType } from '../../_models/hmi';
import { GridsterItemConfig } from 'angular-gridster2';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { EnumToArrayPipe } from '../../_helpers/utils';

@Component({
    selector: 'app-card-config',
    templateUrl: './card-config.component.html',
    styleUrls: ['./card-config.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSelect, MatOption, FormsModule, MatDialogActions, MatButton, MatDialogClose, TranslatePipe, EnumToArrayPipe]
})
export class CardConfigComponent implements OnInit {
    private translateService = inject(TranslateService);
    dialogRef = inject<MatDialogRef<CardConfigComponent>>(MatDialogRef);
    data = inject<CardConfigType>(MAT_DIALOG_DATA);


    cardType = CardWidgetType;
    card: CardWidget;
    scaleMode = PropertyScaleModeType;

    constructor() {
        this.card = this.data.item.card;
        }

    ngOnInit() {
        Object.keys(this.cardType).forEach(key => {
            this.translateService.get(this.cardType[key]).subscribe((txt: string) => { this.cardType[key] = txt; });
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.item.content = null;
        if (this.card.type === CardWidgetType.view) {
        } else if (this.card.type === CardWidgetType.iframe) {
            this.data.item.content = this.card.data;
        }
        this.dialogRef.close(this.data.item);
    }
}

export interface CardConfigType {
    item: GridsterItemConfig;
    views: string[];
}
