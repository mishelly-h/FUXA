/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, input } from '@angular/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'sel-options',
    templateUrl: './sel-options.component.html',
    styleUrls: ['./sel-options.component.css'],
    imports: [MatSelectionList, FormsModule, MatListOption]
})
export class SelOptionsComponent {

    readonly disabled = input<any>(undefined);
    @Input() selected = [];
    readonly options = input([]);
    @Input() extSelected;

    constructor() { }

}

export type SelOptionType = any & { id: any; selected: boolean; label: string };
