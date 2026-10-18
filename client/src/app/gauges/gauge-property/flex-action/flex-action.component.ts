import { Component, OnInit, inject, input } from '@angular/core';

import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Utils, EnumToArrayPipe } from '../../../_helpers/utils';

import { GaugeProperty, GaugeAction, GaugeRangeProperty, GaugeActionsType, GaugeActionBlink, GaugeActionRotate, GaugeActionMove, GaugeActionMoveByTags, GaugeActionLoadImage } from '../../../_models/hmi';
import { FlexVariableComponent } from '../flex-variable/flex-variable.component';
import { RangeNumberComponent } from '../../../gui-helpers/range-number/range-number.component';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ColorPickerDirective } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from '../../../_directives/number.directive';

@Component({
    selector: 'flex-action',
    templateUrl: './flex-action.component.html',
    styleUrls: ['./flex-action.component.css'],
    imports: [FlexVariableComponent, RangeNumberComponent, MatSelect, MatOption, MatIconButton, MatIcon, ColorPickerDirective, FormsModule, NumberOnlyDirective, TranslatePipe, EnumToArrayPipe]
})
export class FlexActionComponent implements OnInit {
    private translateService = inject(TranslateService);


    readonly data = input<any>(undefined);
    readonly property = input<GaugeProperty>(undefined);
    readonly withBitmask = input(false);

    actions: GaugeAction[];
    actionsSupported: any;
    actionBlink = Object.keys(GaugeActionsType).find(key => GaugeActionsType[key] === GaugeActionsType.blink);
    actionRotate = Object.keys(GaugeActionsType).find(key => GaugeActionsType[key] === GaugeActionsType.rotate);
    actionMove = Object.keys(GaugeActionsType).find(key => GaugeActionsType[key] === GaugeActionsType.move);
    actionMoveByTags = Object.keys(GaugeActionsType).find(key => GaugeActionsType[key] === GaugeActionsType.moveByTags);
    actionLoadImage = Object.keys(GaugeActionsType).find(key => GaugeActionsType[key] === GaugeActionsType.loadImage);
    itemtype: any;
    slideView = true;
    defaultColor = Utils.defaultColor;

    ngOnInit() {
        const property = this.property();
        if (property) {
            this.actions = property.actions;
        }
        this.actions?.forEach(act => {
            if (this.isMoveByTags(act)) {
                this.ensureMoveByTagsOptions(act);
            }
        });
        if (!this.actions || this.actions.length <= 0) {
            this.onAddAction();
        }
        const data = this.data();
        if (data.withActions) {
			this.actionsSupported = data.withActions;
			Object.keys(this.actionsSupported).forEach(key => {
				this.translateService.get(this.actionsSupported[key]).subscribe((txt: string) => { this.actionsSupported[key] = txt; });
			});
		}
    }

    getActions() {
        let result = null;
        if (this.actions) {
            result = [];
            this.actions.forEach(act => {
                if (act.variableId) {
                    result.push(act);
                }
            });
        }
        return result;
    }

    onAddAction() {
        let ga: GaugeAction = new GaugeAction();
        ga.range = new GaugeRangeProperty();
        this.addAction(ga);
    }

    onRemoveAction(index: number) {
        this.actions.splice(index, 1);
    }

    onRangeViewToggle(slideView) {
        this.slideView = slideView;
        // this.flexInput.changeTag(this.currentTag);
    }

    setVariable(index, event) {
        this.actions[index].variableId = event.variableId;
        this.actions[index].bitmask = this.isMoveByTags(this.actions[index]) ? null : event.bitmask;
    }

    private addAction(ga: GaugeAction) {
        if (!this.actions) {
            this.actions = [];
        }
        this.actions.push(ga);
    }

    onCheckActionType(type: any, ga: GaugeAction) {
        if (type === this.actionBlink && typeof(ga.options) !== typeof(GaugeActionBlink)) {
            ga.options = new GaugeActionBlink();
        } else if (type === this.actionRotate && typeof(ga.options) !== typeof(GaugeActionRotate)) {
            ga.options = new GaugeActionRotate();
        } else if (type === this.actionMove && typeof(ga.options) !== typeof(GaugeActionMove)) {
            ga.options = new GaugeActionMove();
        } else if (type === this.actionMoveByTags) {
            this.ensureMoveByTagsOptions(ga);
            ga.bitmask = null;
        } else if (type === this.actionLoadImage && typeof(ga.options) !== typeof(GaugeActionLoadImage)) {
            ga.options = new GaugeActionLoadImage();
        }
    }

    isMoveByTags(item: GaugeAction): boolean {
        return item?.type === this.actionMoveByTags;
    }

    private ensureMoveByTagsOptions(ga: GaugeAction) {
        ga.options = Object.assign(new GaugeActionMoveByTags(), ga.options || {});
        if (ga.options.axis !== 'y') {
            ga.options.axis = 'x';
        }
        ga.bitmask = null;
    }
}
