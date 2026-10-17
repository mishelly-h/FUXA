import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GaugesManager } from '../gauges/gauges.component';
import { Subscription, timer } from 'rxjs';

import { HmiService } from '../_services/hmi.service';
import { TesterService } from '../tester/tester.service';
import { Variable } from '../_models/hmi';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatDialogActions } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'app-tester',
    templateUrl: './tester.component.html',
    styleUrls: ['./tester.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CdkDrag, MatDialogActions, FormsModule, MatButton, TranslatePipe]
})
export class TesterComponent implements OnInit, OnDestroy {

    show = false;
    items: Variable[] = [];
    output: string[] = [];
    subscription: Subscription;
    demoSwitch = true;

    // items: Map<string, GaugeSettings> = new Map<string, GaugeSettings>();


    constructor(private hmiService: HmiService, private gaugesManager: GaugesManager,
        private testerService: TesterService) { }

    ngOnInit() {
        this.testerService.change.subscribe(isOpen => {
            this.show = isOpen;
        });

        this.gaugesManager.onevent.subscribe(event => {
            if (event.dbg) {
                this.addOutput(event.dbg);
            }
        });
    }

    ngOnDestroy() {
        this.stopDemo();
    }

    setSignal(sig: any) {
        this.hmiService.setSignalValue(sig);
        this.addOutput(' > ' + sig.source + ' - ' + sig.name + ' = ' + sig.value);
    }

    setSignals(items: any) {
        this.items = items;
    }

    setDemo(flag) {
        if (flag) {
            // this.gaugesManager.startDemo();
        } else {
            // this.gaugesManager.stopDemo();
        }
    }

    addOutput(item: string) {
        this.output.unshift(item);
    }

    close() {
        this.testerService.toggle(false);
    }

    startDemo() {
        this.stopDemo();
        let sourcetimer = timer(2000, 1500);
        this.subscription = sourcetimer.subscribe(t => {
            this.demoValue();
        });
    }

    stopDemo() {
        try {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
        } catch (e) {

        }
    }

    demoValue() {
    }
}
