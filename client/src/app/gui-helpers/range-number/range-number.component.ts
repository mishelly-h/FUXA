 
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from '../../_directives/number.directive';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'range-number',
    templateUrl: './range-number.component.html',
    styleUrls: ['./range-number.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, NumberOnlyDirective, MatSelect, MatOption, MatIconButton, MatTooltip, TranslatePipe]
})
export class RangeNumberComponent implements OnInit {
    @Input() range: IItemRange = { min: 0, max: 100 };

    isNumber = true;
    booleanValue = 1;
    oldRange: IItemRange = { min: 0, max: 100 };
    constructor() { }

    ngOnInit() {
        this.saveOld(this.range);
    }

    onBooleanChanged() {
        this.range.min = this.booleanValue;
        this.range.max = this.booleanValue;
    }

    onTypeChanged() {
        if (this.isNumber) {
            this.range.min = this.oldRange.min;
            this.range.max = this.oldRange.max;
        } else {
            this.booleanValue = (this.range.min === this.range.max && this.range.min >= 1) ? 1 : 0;
            this.onBooleanChanged();
        }
    }

    private saveOld(oldValue: IItemRange) {
        this.oldRange.min = oldValue.min;
        this.oldRange.max = oldValue.max;
    }
}

interface IItemRange {
    min: number;
    max: number;
}
