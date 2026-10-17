import { Component, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { GaugeBaseComponent } from '../../gauge-base/gauge-base.component';
import { GaugeSettings, Variable, GaugeStatus } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';
import { GaugeDialogType } from '../../gauge-property/gauge-property.component';

import { NgxGaugeComponent } from '../../../gui-helpers/ngx-gauge/ngx-gauge.component';

@Component({
    selector: 'app-html-bag',
    templateUrl: './html-bag.component.html',
    styleUrls: ['./html-bag.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class HtmlBagComponent extends GaugeBaseComponent {
    static TypeTag = 'svg-ext-html_bag';
    static LabelTag = 'HtmlBag';
    static prefixD = 'D-BAG_';

    constructor() {
        super();
    }

    static getSignals(pro: any) {
        let res: string[] = [];
        if (pro.variableId) {
            res.push(pro.variableId);
        }
        return res;
    }

    static getDialogType(): GaugeDialogType {
        return GaugeDialogType.Gauge;
    }

    static processValue(ga: GaugeSettings, svgele: any, sig: Variable, gaugeStatus: GaugeStatus, gauge?: NgxGaugeComponent) {
        try {
            gauge.setValue(sig.value);
        } catch (err) {
            console.error(err);
        }
    }

    static initElement(gab: GaugeSettings, viewContainerRef: ViewContainerRef, isview: boolean) {
        let ele = document.getElementById(gab.id);
        if (ele) {
            ele?.setAttribute('data-name', gab.name);
            let htmlBag = Utils.searchTreeStartWith(ele, this.prefixD);
            if (htmlBag) {
                const componentRef = viewContainerRef.createComponent(NgxGaugeComponent);
                htmlBag.innerHTML = '';

                componentRef.changeDetectorRef.detectChanges();
                const loaderComponentElement = componentRef.location.nativeElement;
                htmlBag.appendChild(loaderComponentElement);
                componentRef.instance.resize(htmlBag.clientHeight, htmlBag.clientWidth);
                if (gab.property && gab.property.options) {
                    componentRef.instance.setOptions(gab.property.options);
                    componentRef.instance.init(gab.property.options.type);
                }
                componentRef.instance['name'] = gab.name;
                return componentRef.instance;
            }
        }
    }

    static resize(gab: GaugeSettings, viewContainerRef: ViewContainerRef, options?: any) {
        let ele = document.getElementById(gab.id);
        if (ele) {
            let htmlBag = Utils.searchTreeStartWith(ele, this.prefixD);
            if (htmlBag) {
                const componentRef = viewContainerRef.createComponent(NgxGaugeComponent);
                htmlBag.innerHTML = '';

                componentRef.changeDetectorRef.detectChanges();
                const loaderComponentElement = componentRef.location.nativeElement;
                htmlBag.appendChild(loaderComponentElement);
                componentRef.instance.resize(htmlBag.clientHeight, htmlBag.clientWidth);
                if (options) {
                    componentRef.instance.setOptions(options);
                    componentRef.instance.init(options.type);
                }
                return componentRef.instance;
            }
        }
    }

    static detectChange(gab: GaugeSettings, ref: any) {
        let options;
        if (gab.property && gab.property.options) {
            options = gab.property.options;
        }
        return HtmlBagComponent.resize(gab, ref, options);
    }
}
