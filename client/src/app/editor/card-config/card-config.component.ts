import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { CardWidgetType, CardWidget, PropertyScaleModeType } from '../../_models/hmi';
import { GridsterItemConfig } from 'angular-gridster2';

@Component({
    selector: 'app-card-config',
    templateUrl: './card-config.component.html',
    styleUrls: ['./card-config.component.scss'],
    standalone: false
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
