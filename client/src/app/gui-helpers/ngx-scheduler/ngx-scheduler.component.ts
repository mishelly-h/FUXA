import { Component, OnInit, input, output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-ngx-scheduler',
    templateUrl: './ngx-scheduler.component.html',
    styleUrls: ['./ngx-scheduler.component.scss'],
    standalone: false
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
