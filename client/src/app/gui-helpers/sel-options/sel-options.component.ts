 
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'sel-options',
    templateUrl: './sel-options.component.html',
    styleUrls: ['./sel-options.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SelOptionsComponent {

    @Input() disabled: any;
    @Input() selected = [];
    @Input() options = [];
    @Input() extSelected;

    constructor() { }

}

export type SelOptionType = any & { id: any; selected: boolean; label: string };
