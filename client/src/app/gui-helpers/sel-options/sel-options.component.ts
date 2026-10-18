/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, input } from '@angular/core';

@Component({
    selector: 'sel-options',
    templateUrl: './sel-options.component.html',
    styleUrls: ['./sel-options.component.css'],
    standalone: false
})
export class SelOptionsComponent {

    readonly disabled = input<any>(undefined);
    @Input() selected = [];
    readonly options = input([]);
    @Input() extSelected;

    constructor() { }

}

export type SelOptionType = any & { id: any; selected: boolean; label: string };
