import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, input, output } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { ProjectService } from '../../../_services/project.service';
import { Device, DevicesUtils, PlaceholderDevice, Tag } from '../../../_models/device';
import { DeviceTagSelectionComponent, DeviceTagSelectionData } from '../../../device/device-tag-selection/device-tag-selection.component';
import { Utils } from '../../../_helpers/utils';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete, MatOptgroup, MatOption } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export const _filter = (opt: DeviceTagOption[], value: string): DeviceTagOption[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => item.name.toLowerCase().includes(filterValue));
};

@Component({
    selector: 'app-flex-device-tag',
    templateUrl: './flex-device-tag.component.html',
    styleUrls: ['./flex-device-tag.component.scss'],
    imports: [MatIconButton, MatIcon, MatInput, FormsModule, MatAutocompleteTrigger, ReactiveFormsModule, MatAutocomplete, MatOptgroup, MatOption, AsyncPipe, TranslatePipe]
})
export class FlexDeviceTagComponent implements OnInit, OnChanges {
    private projectService = inject(ProjectService);
    dialog = inject(MatDialog);


    readonly tagTitle = input('');
    readonly readonly = input(false);
    @Input() variableId: string;
    @Input() deviceTagValue: FlexDeviceTagValueType;

    readonly onchange = output<FlexDeviceTagValueType>();

    devicesGroups: DeviceGroup[] = [];
    devicesTags$: Observable<DeviceGroup[]>;
    tagFilter = new UntypedFormControl();
    devices: Device[] = [];

    ngOnInit() {
        if (!this.deviceTagValue) {
            this.deviceTagValue = {
                variableId: this.variableId
            };
        } else {
            this.variableId = this.deviceTagValue.variableId;
        }
        this.loadDevicesTags();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['variableId'] && !changes['variableId'].isFirstChange()) {
            this.deviceTagValue = {
                variableId: this.variableId
            };
            this.loadDevicesTags();
        }
    }

    private _tagToVariableName(tag: Tag) {
        let result = tag.label || tag.name;
        if (result && tag.address && result !== tag.address) {
            result = result + ' - ' + tag.address;
        }
        return result;
    }

    private _filterGroup(value: any): DeviceGroup[] {
        if (value) {
            return this.devicesGroups
                .map(device => ({ name: device.name, tags: _filter(device.tags, value?.name || value) }))
                .filter(device => device.tags.length > 0);
        }
        return this.devicesGroups;
    }

    private _getDeviceTag(tagId: string): DeviceTagOption {
        for (let i = 0; i < this.devicesGroups.length; i++) {
            const tag = this.devicesGroups[i].tags.find(tag => tag.id === tagId);
            if (tag) {
                return tag;
            }
        }
        return null;
    }

    private _setSelectedTag() {
        const tag = this._getDeviceTag(this.variableId);
        this.tagFilter.patchValue(tag);
    }

    displayFn(deviceTag: DeviceTagOption): string {
        return deviceTag?.name;
    }

    onDeviceTagSelected(deviceTag: DeviceTagOption) {
        this.variableId = deviceTag.id;
        this.onChanged();
    }

    getDeviceName() {
        const device = DevicesUtils.getDeviceFromTagId(this.devices, this.variableId);
        if (device) {
            return device.name;
        }
        return '';
    }

    onChanged() {
        if (this.tagFilter.value?.startsWith && this.tagFilter.value.startsWith(PlaceholderDevice.id)) {
            this.deviceTagValue.variableId = this.tagFilter.value;
            this.deviceTagValue.variableRaw = null;
        } else if (this.tagFilter.value?.id?.startsWith && this.tagFilter.value.id.startsWith(PlaceholderDevice.id)) {
            this.deviceTagValue.variableId = this.tagFilter.value.id;
            this.deviceTagValue.variableRaw = null;
        } else {
            let tag = DevicesUtils.getTagFromTagId(this.devices, this.variableId);
            if (tag) {
                this.deviceTagValue.variableId = tag.id;
                this.deviceTagValue.variableRaw = tag;
            } else {
                this.deviceTagValue.variableId = null;
                this.deviceTagValue.variableRaw = null;
            }
        }
        this.onchange.emit(this.deviceTagValue);   // Legacy
    }

    onBindTag() {
        let dialogRef = this.dialog.open(DeviceTagSelectionComponent, {
            disableClose: true,
            position: { top: '60px' },
            data: <DeviceTagSelectionData>{
                variableId: this.variableId
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.deviceName) {
                    this.loadDevicesTags();
                }
                this.variableId = result.variableId;
                this._setSelectedTag();
                this.onChanged();
            }
        });
    }

    private loadDevicesTags() {
        this.devicesGroups = [];
        this.devicesGroups.push(Utils.clone(PlaceholderDevice));
        this.devices = Object.values(this.projectService.getDevices());
        this.devices.forEach((device: Device) => {
            let deviceGroup = <DeviceGroup>{
                name: device.name,
                tags: [],
            };
            Object.values(device.tags).forEach((tag: Tag) => {
                const deviceTag = <DeviceTagOption>{
                    id: tag.id,
                    name: this._tagToVariableName(tag),
                    device: device.name
                };
                deviceGroup.tags.push(deviceTag);
            });
            this.devicesGroups.push(deviceGroup);
        });

        this.devicesTags$ = this.tagFilter.valueChanges.pipe(
            startWith(''),
            map(value => this._filterGroup(value || '')),
        );
        if (this.variableId?.startsWith(PlaceholderDevice.id)) {
            this.devicesGroups[0].tags.push({
                id: this.variableId,
                name: this.variableId,
                device: '@'
            });
        }
        this._setSelectedTag();
    }
}

export interface FlexDeviceTagValueType {
    variableId: string;
    variableRaw?: string | Tag;
}

interface DeviceGroup {
    name: string;
    tags: DeviceTagOption[];
}

interface DeviceTagOption {
    id: string;
    name: string;
    device: string;
}
