/* eslint-disable @angular-eslint/component-selector */
import { Component, ElementRef, AfterViewInit, viewChild } from '@angular/core';

@Component({
    selector: 'ngx-switch',
    templateUrl: './ngx-switch.component.html',
    styleUrls: ['./ngx-switch.component.css']
})
export class NgxSwitchComponent implements AfterViewInit {

    public readonly switcher = viewChild<ElementRef>('switcher');
    public readonly slider = viewChild<ElementRef>('slider');
    public readonly toggler = viewChild<ElementRef>('toggler');
    options: SwitchOptions = new SwitchOptions();
    checked = false;
    onUpdate: any;
    disabled = false;

    constructor() {
    }

    ngAfterViewInit() {
        this.onRefresh();
    }

    onClick() {
        this.onRefresh();
        if (this.onUpdate) {
            this.onUpdate((this.checked) ? this.options.onValue.toString() : this.options.offValue.toString());
        }
    }

    onRefresh() {
        this.checked = this.switcher().nativeElement.checked;
        this.toggler().nativeElement.classList.toggle('active', this.checked);
        const switcher = this.switcher();
        const toggler = this.toggler();
        const slider = this.slider();
        if (switcher.nativeElement.checked) {
            toggler.nativeElement.style.backgroundColor = this.options.onBackground;
            slider.nativeElement.style.backgroundColor = this.options.onSliderColor;
            slider.nativeElement.style.color = this.options.onTextColor;
            slider.nativeElement.innerHTML = this.options.onText;
        } else {
            toggler.nativeElement.style.backgroundColor = this.options.offBackground;
            slider.nativeElement.style.backgroundColor = this.options.offSliderColor;
            slider.nativeElement.style.color = this.options.offTextColor;
            slider.nativeElement.innerHTML = this.options.offText;
        }
        slider.nativeElement.style.lineHeight = this.options.height + 'px';

        switcher.nativeElement.disabled = this.disabled;
        toggler.nativeElement.style.opacity = this.disabled ? '0.5' : '1';
        toggler.nativeElement.style.pointerEvents = this.disabled ? 'none' : 'auto';
    }

    setOptions(options: SwitchOptions, force = false): boolean {
        if (force) {
            this.options = options;
            this.onRefresh();
        } else {
            setTimeout(() => {
                this.options = options;
                this.onRefresh();
            }, 200);
        }
        return true;
    }

    setValue(value: number) {
        this.switcher().nativeElement.checked = (value) ? true : false;
        this.onRefresh();
    }

    setDisabled(state: boolean) {
        this.disabled = state;
        this.onRefresh();
    }

    bindUpdate(calback: any) {
        this.onUpdate = calback;
    }
}

export class SwitchOptions {
    offValue = 0;
    onValue = 1;
    offBackground = '#ccc';
    onBackground = '#ccc';
    offText = '';
    onText = '';
    offSliderColor = '#fff';
    onSliderColor = '#0CC868';
    offTextColor = '#000';
    onTextColor = '#fff';
    fontSize = 12;
    fontFamily = '';
    radius = 0;
    height: number;
}
