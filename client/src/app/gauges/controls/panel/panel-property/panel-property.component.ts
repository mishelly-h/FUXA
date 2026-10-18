import { Component, Input, OnInit, output } from '@angular/core';
import { GaugePanelProperty, PropertyScaleModeType } from '../../../../_models/hmi';
import { FlexDeviceTagValueType, FlexDeviceTagComponent } from '../../../gauge-property/flex-device-tag/flex-device-tag.component';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { TranslatePipe } from '@ngx-translate/core';
import { EnumToArrayPipe } from '../../../../_helpers/utils';

@Component({
    selector: 'app-panel-property',
    templateUrl: './panel-property.component.html',
    styleUrls: ['./panel-property.component.scss'],
    imports: [FormsModule, FlexDeviceTagComponent, MatSelect, MatOption, TranslatePipe, EnumToArrayPipe]
})
export class PanelPropertyComponent implements OnInit {

    @Input() data: any;
    readonly onPropChanged = output<any>();
    @Input('reload') set reload(b: any) {
        this._reload();
    }
    property: GaugePanelProperty;
    scaleMode = PropertyScaleModeType;

    constructor() { }

    ngOnInit() {
        this._reload();
    }

    onPropertyChanged() {
        this.onPropChanged.emit(this.data.settings);
    }

    onTagChanged(daveiceTag: FlexDeviceTagValueType) {
        this.data.settings.property.variableId = daveiceTag.variableId;
        this.onPropertyChanged();
    }

    private _reload() {
        if (!this.data.settings.property) {
            this.data.settings.property = <GaugePanelProperty>{ viewName: null, variableId: null, scaleMode: null };
        }
        this.property = this.data.settings.property;
    }
}
