import { Component, OnInit, Input, inject, output } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { GaugeIframeProperty } from '../../../../_models/hmi';
import { FlexDeviceTagValueType } from '../../../gauge-property/flex-device-tag/flex-device-tag.component';

@Component({
    selector: 'app-iframe-property',
    templateUrl: './iframe-property.component.html',
    styleUrls: ['./iframe-property.component.scss'],
    standalone: false
})
export class IframePropertyComponent implements OnInit {
    private translateService = inject(TranslateService);


    @Input() data: any;
    readonly onPropChanged = output<any>();
    @Input('reload') set reload(b: any) {
        this._reload();
    }

    property: GaugeIframeProperty;

    ngOnInit() {
        this._reload();
    }

    onPropertyChanged() {
        this.onPropChanged.emit(this.data.settings);
    }

    onTagChanged(daveiceTag: FlexDeviceTagValueType) {
        this.data.settings.property.variableId = daveiceTag.variableId;
        this.onPropChanged.emit(this.data.settings);
    }

    private _reload() {
        if (!this.data.settings.property) {
            this.data.settings.property = <GaugeIframeProperty>{ address: null, variableId: null };
        }
        this.property = this.data.settings.property;
    }
}
