import { ChangeDetectorRef, Component, OnInit, inject, viewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ProjectService } from '../../_services/project.service';
import { MapsLocation, MAPSLOCATION_PREFIX } from '../../_models/maps';
import { Utils } from '../../_helpers/utils';
import { GaugeAction, GaugeRangeProperty, View, ViewType } from '../../_models/hmi';
import { FlexDeviceTagValueType, FlexDeviceTagComponent } from '../../gauges/gauge-property/flex-device-tag/flex-device-tag.component';
import { FlexActionsStandaloneComponent } from '../../gauges/gauge-property/flex-actions-standalone/flex-actions-standalone.component';
import { UploadFile } from '../../_models/project';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { IconSelectorComponent } from '../../framework/icon-selector/icon-selector.component';
import { ColorPickerDirective } from 'ngx-color-picker';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-maps-location-property',
    templateUrl: './maps-location-property.component.html',
    styleUrls: ['./maps-location-property.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatTabGroup, MatTab, MatSelect, MatOption, MatSlideToggle, IconSelectorComponent, ColorPickerDirective, FlexDeviceTagComponent, MatIconButton, MatTooltip, FlexActionsStandaloneComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class MapsLocationPropertyComponent implements OnInit {
    dialogRef = inject<MatDialogRef<MapsLocationPropertyComponent>>(MatDialogRef);
    private fb = inject(UntypedFormBuilder);
    private translateService = inject(TranslateService);
    private projectService = inject(ProjectService);
    private cdr = inject(ChangeDetectorRef);
    data = inject<MapsLocation>(MAT_DIALOG_DATA);


    location: MapsLocation;
    formGroup: UntypedFormGroup;
    views: View[] = [];
    actions: GaugeAction[] = [];
    defaultColor = Utils.defaultColor;
    readonly flexActionsStandalone = viewChild<FlexActionsStandaloneComponent>('flexActionsStandalone');

    constructor() {
            this.location = this.data ?? new MapsLocation(Utils.getGUID(MAPSLOCATION_PREFIX));
    }

    ngOnInit() {
        this.views = this.projectService.getViews()?.filter(view => view.type !== ViewType.maps);
        this.actions = Utils.clone(this.location.actions || []);
        this.formGroup = this.fb.group({
            name: [this.location.name, Validators.required],
            latitude: [this.location.latitude],
            longitude: [this.location.longitude],
            viewId: [this.location.viewId],
            pageId: [this.location.pageId],
            url: [this.location.url],
            description: [this.location.description],
            showMarkerName: [this.location.showMarkerName],
            showMarkerIcon: [this.location.showMarkerIcon],
            showMarkerValue: [this.location.showMarkerValue],
            markerIcon: [this.location.markerIcon],
            markerImage: [this.location.markerImage],
            markerBackground: [this.location.markerBackground ?? '#ffffff'],
            markerColor: [this.location.markerColor ?? '#000000'],
            markerTagValueId: [this.location.markerTagValueId]
        });
        this.formGroup.controls.name.addValidators(this.isValidName());
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        const actions = this.flexActionsStandalone()?.getActions() || [];
        this.location = {...this.location, ...this.formGroup.getRawValue(), actions };
        this.dialogRef.close(this.location);
    }

    isValidName(): ValidatorFn {
        const names = this.projectService.getMapsLocations().map(ml => ml.name);
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.location?.name === control.value) {
                return null;
            }
            if (names?.indexOf(control.value) !== -1) {
                return { name: this.translateService.instant('msg.maps-location-name-exist') };
            }
            return null;
        };
    }

    onMarkerIconSelected() {
        this.formGroup.get('markerImage')?.setValue('');
    }

    onSetMarkerImage(event) {
        if (event.target.files) {
            let filename = event.target.files[0].name;
            let fileToUpload = { type: filename.split('.').pop().toLowerCase(), name: filename.split('/').pop(), data: null };
            let reader = new FileReader();
            reader.onload = () => {
                try {
                    fileToUpload.data = reader.result;
                    this.projectService.uploadFile(fileToUpload).subscribe((result: UploadFile) => {
                        this.formGroup.get('markerImage')?.setValue(result.location);
                        this.formGroup.get('markerIcon')?.setValue('image');
                        this.cdr.detectChanges();
                    });
                } catch (err) {
                    console.error(err);
                }
            };
            if (fileToUpload.type === 'svg') {
                reader.readAsText(event.target.files[0]);
            } else {
                reader.readAsDataURL(event.target.files[0]);
            }
        }
    }

    onTagChanged(tag: FlexDeviceTagValueType) {
        this.formGroup.get('markerTagValueId')?.setValue(tag.variableId);
    }

    onAddAction() {
        const ga = new GaugeAction();
        ga.range = new GaugeRangeProperty();
        this.actions.push(ga);
    }
}
