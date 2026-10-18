import { Component, OnInit, AfterViewInit, inject, viewChild } from '@angular/core';

import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { GaugeProperty } from '../../../../_models/hmi';

import { FlexAuthComponent } from '../../../gauge-property/flex-auth/flex-auth.component';
import { FlexHeadComponent } from '../../../gauge-property/flex-head/flex-head.component';
import { HtmlSwitchComponent } from '../html-switch.component';
import { NgxSwitchComponent, SwitchOptions } from '../../../../gui-helpers/ngx-switch/ngx-switch.component';
import { Define } from '../../../../_helpers/define';
import { Utils } from '../../../../_helpers/utils';
import { FlexEventComponent } from '../../../gauge-property/flex-event/flex-event.component';
import { DialogDraggableDirective } from '../../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { ColorPickerDirective } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from '../../../../_directives/number.directive';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-html-switch-property',
    templateUrl: './html-switch-property.component.html',
    styleUrls: ['./html-switch-property.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatTabGroup, MatTab, FlexAuthComponent, FlexHeadComponent, ColorPickerDirective, FormsModule, NumberOnlyDirective, MatSelect, MatOption, NgxSwitchComponent, MatIconButton, MatTooltip, FlexEventComponent, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class HtmlSwitchPropertyComponent implements OnInit, AfterViewInit {
    dialogRef = inject<MatDialogRef<HtmlSwitchPropertyComponent>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);


    readonly switcher = viewChild<NgxSwitchComponent>('switcher');
	readonly flexhead = viewChild<FlexHeadComponent>('flexhead');
    readonly flexauth = viewChild<FlexAuthComponent>('flexauth');
    readonly flexEvent = viewChild<FlexEventComponent>('flexevent');

    property: GaugeProperty;
    options: SwitchOptions;
    name: string;
    switchWidth = 80;
    switchHeight = 40;
    fonts = Define.fonts;
    defaultColor = Utils.defaultColor;
    withBitmask = false;
	eventsSupported: boolean;

    constructor() {
        this.property = <GaugeProperty>JSON.parse(JSON.stringify(this.data.settings.property));
        if (!this.property) {
            this.property = new GaugeProperty();
        }
        this.name = this.data.settings.name;
        this.options = <SwitchOptions>this.property.options;
        if (!this.options) {
            this.options = new SwitchOptions();
        }
        let switchsize = HtmlSwitchComponent.getSize(this.data.settings);
        this.switchHeight = switchsize.height;
        this.switchWidth = switchsize.width;
        this.options.height = this.switchHeight;
        this.eventsSupported = this.data.withEvents;
    }

    ngOnInit(): void {
        if (this.data.withBitmask) {
            this.withBitmask = this.data.withBitmask;
        }
    }

    ngAfterViewInit() {
        this.updateOptions();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.settings.property = this.property;
        this.data.settings.property.permission = this.flexauth().permission;
        this.data.settings.property.permissionRoles = this.flexauth().permissionRoles;
        this.data.settings.property.options = this.options;
        this.data.settings.name = this.flexauth().name;
        const flexEvent = this.flexEvent();
        if (flexEvent) {
            this.data.settings.property.events = flexEvent.getEvents();
        }
    }

    onAddEvent() {
        this.flexEvent().onAddEvent();
    }

    updateOptions() {
        this.switcher()?.setOptions(this.options);
    }
}
