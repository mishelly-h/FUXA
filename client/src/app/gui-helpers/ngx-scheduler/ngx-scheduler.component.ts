import { Component, OnInit, input, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { NumberOnlyDirective } from '../../_directives/number.directive';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-ngx-scheduler',
    templateUrl: './ngx-scheduler.component.html',
    styleUrls: ['./ngx-scheduler.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatTabGroup, MatTab, MatButtonToggleGroup, MatButtonToggle, MatTooltip, NumberOnlyDirective, MatIconButton, MatIcon, MatInput, TranslatePipe]
})
export class NgxSchedulerComponent implements OnInit {

    readonly removable = input(true);
    readonly formGroup = input<FormGroup>(undefined);
    readonly onRemove = output<void>();

    selectedTabIndex: number = 0;
    selectedTabFormControl = new FormControl(this.selectedTabIndex);

    constructor(
      ) { }

    ngOnInit() {
        this.selectedTabIndex = this.formGroup().value.type;
    }

    onTabSelectionChange(event: number) {
        this.formGroup().controls.type.setValue(event);
    }

    onRemoveScheduling() {
        this.onRemove.emit(undefined);
    }

}
