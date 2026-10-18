import { Component, OnInit, OnDestroy, ViewContainerRef, ChangeDetectorRef, inject, viewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProjectService } from '../_services/project.service';
import { AppService } from '../_services/app.service';
import { Hmi, View } from '../_models/hmi';
import { GaugesManager } from '../gauges/gauges.component';
import { TesterService } from '../tester/tester.service';
import { TesterComponent } from '../tester/tester.component';
import { FuxaViewComponent } from '../fuxa-view/fuxa-view.component';
import { MatMiniFabButton } from '@angular/material/button';

declare var SVG: any;
declare var Raphael: any;

@Component({
    templateUrl: 'lab.component.html',
    styleUrls: ['lab.component.css'],
    imports: [FuxaViewComponent, MatMiniFabButton, TesterComponent]
})

export class LabComponent implements OnInit, OnDestroy {
    private projectService = inject(ProjectService);
    private appService = inject(AppService);
    gaugesManager = inject(GaugesManager);
    private changeDetector = inject(ChangeDetectorRef);
    private testerService = inject(TesterService);


    readonly entry = viewChild('messagecontainer', { read: ViewContainerRef });
    readonly tester = viewChild<TesterComponent>('tester');

    currentView: View = new View();
    hmi: Hmi = new Hmi();
    svgMain: any;
    componentRef: any;
    labView: View = null;
	backgroudColor = 'unset';

	private subscriptionLoad: Subscription;

    ngOnInit() {
        try {
            this.appService.showLoading(true);
            let hmi = this.projectService.getHmi();
            if (!hmi) {
                this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(load => {
                    this.appService.showLoading(false);
                    this.loadHmi();
                }, error => {
                    this.appService.showLoading(false);
                    console.error('Error loadHMI');
                });
            } else {
                this.appService.showLoading(false);
                this.loadHmi();
            }
            this.changeDetector.detectChanges();
        }
        catch (err) {
            this.appService.showLoading(false);
            console.error(err);
        }
    }

    ngOnDestroy() {
        try {
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
        } catch (e) {
        }
    }

    onTest() {
        this.tester().setSignals(this.gaugesManager.getMappedGaugesSignals(true));
        this.testerService.toggle(true);
    }

    private loadHmi() {
        this.hmi = this.projectService.getHmi();
        if (this.hmi && this.hmi.views && this.hmi.views.length > 0) {
            this.currentView = this.hmi.views[0];
            this.labView = this.hmi.views[0];
            let oldsel = localStorage.getItem('@frango.webeditor.currentview');
            if (oldsel) {
                for (let i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].name === oldsel) {
                        this.currentView = this.hmi.views[i];
                        this.setBackground();
                        break;
                    }
                }
            }
        }
    }

    private setBackground() {
		if (this.currentView && this.currentView.profile) {
			this.backgroudColor = this.currentView.profile.bkcolor;
		}
	}
}
