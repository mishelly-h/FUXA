import { Component, Input, OnInit, input, output } from '@angular/core';
import { IPropertyVariable, View } from '../../../_models/hmi';
import { FlexVariableComponent } from '../flex-variable/flex-variable.component';

@Component({
    selector: 'flex-variable-map',
    templateUrl: './flex-variable-map.component.html',
    styleUrls: ['./flex-variable-map.component.scss'],
    imports: [FlexVariableComponent]
})
export class FlexVariableMapComponent implements OnInit {
    readonly view = input<View>(undefined);
    readonly data = input<any>(undefined);
    @Input() value: any;
    readonly placeholders = input<any>([]);
    readonly valueChange = output<any>();

    constructor() {
    }

    ngOnInit() {
        if (!this.value) {
            this.value = {};
        }
        this.value.from = this.value.from || {};
        this.value.to = this.value.to || {};
    }

    onValueChange() {
        this.valueChange.emit(this.value);
    }

    compareVariables(v1, v2) {
        return v1 && v2 && v1.variableId == v2.variableId;
    }
}

export interface VariableMapItemType {
    from: IPropertyVariable;
    to: IPropertyVariable;
}
