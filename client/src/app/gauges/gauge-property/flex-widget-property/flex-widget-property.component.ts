import { Component, OnInit, inject, input } from '@angular/core';
import { WidgetProperty } from '../../../_models/hmi';
import { ProjectService } from '../../../_services/project.service';
import { SvgUtils } from '../../../_helpers/svg-utils';

@Component({
    selector: 'flex-widget-property',
    templateUrl: './flex-widget-property.component.html',
    styleUrls: ['./flex-widget-property.component.scss'],
    standalone: false
})
export class FlexWidgetPropertyComponent implements OnInit {
    private projectService = inject(ProjectService);


    readonly property = input<WidgetProperty>(undefined);
    dataDevices = { devices: []};

    constructor() {
        this.dataDevices = {
            devices: Object.values(this.projectService.getDevices())
        };
    }

    ngOnInit() {
        // Populate defaults from SVG script if available
        const property = this.property();
        if (property?.varsToBind?.length && property?.scriptContent?.content) {
            property.varsToBind = SvgUtils.populateDefaults(
                property.scriptContent.content,
                property.varsToBind
            );
        }
    }
}
