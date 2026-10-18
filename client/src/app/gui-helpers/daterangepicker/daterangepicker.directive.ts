/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import { Directive, ViewContainerRef, ComponentFactoryResolver, ElementRef, HostListener, forwardRef, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges, Input, DoCheck, KeyValueDiffer, KeyValueDiffers, Renderer2, inject, input, output } from '@angular/core';
import { DaterangepickerComponent } from './daterangepicker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _moment from 'moment';
import { LocaleConfig } from './daterangepicker.config';
import { LocaleService } from './locale.service';
const moment = _moment;

@Directive({
    selector: 'input[ngxDaterangepickerMd]',
    host: {
        '(keyup.esc)': 'hide()',
        '(blur)': 'onBlur()',
        '(click)': 'open()'
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DaterangepickerDirective), multi: true
        }
    ],
    standalone: false
})
export class DaterangepickerDirective implements OnInit, OnChanges, DoCheck {
  viewContainerRef = inject(ViewContainerRef);
  _changeDetectorRef = inject(ChangeDetectorRef);
  private _componentFactoryResolver = inject(ComponentFactoryResolver);
  private _el = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private differs = inject(KeyValueDiffers);
  private _localeService = inject(LocaleService);

  public picker: DaterangepickerComponent;
  private _onChange = Function.prototype;
  private _onTouched = Function.prototype;
  private _validatorChange = Function.prototype;
  private _value: any;
  private localeDiffer: KeyValueDiffer<string, any>;
  readonly minDate = input<_moment.Moment>(undefined);
  readonly maxDate = input<_moment.Moment>(undefined);
  readonly autoApply = input<boolean>(undefined);
  readonly alwaysShowCalendars = input<boolean>(undefined);
  readonly showCustomRangeLabel = input<boolean>(undefined);
  readonly linkedCalendars = input<boolean>(undefined);
  readonly dateLimit = input<number>(null);
  readonly singleDatePicker = input<boolean>(undefined);
  readonly showWeekNumbers = input<boolean>(undefined);
  readonly showISOWeekNumbers = input<boolean>(undefined);
  readonly showDropdowns = input<boolean>(undefined);
  readonly isInvalidDate = input<Function>(undefined);
  readonly isCustomDate = input<Function>(undefined);
  readonly showClearButton = input<boolean>(undefined);
  readonly ranges = input<any>(undefined);
  @Input()
  opens: string;
  @Input()
  drops: string;
  firstMonthDayClass: string;
  readonly lastMonthDayClass = input<string>(undefined);
  readonly emptyWeekRowClass = input<string>(undefined);
  readonly firstDayOfNextMonthClass = input<string>(undefined);
  readonly lastDayOfPreviousMonthClass = input<string>(undefined);
  readonly keepCalendarOpeningWithRange = input<boolean>(undefined);
  readonly showRangeLabelOnInput = input<boolean>(undefined);
  readonly showCancel = input(false);
  // timepicker variables
  readonly timePicker = input<Boolean>(false);
  readonly timePicker24Hour = input<Boolean>(false);
  readonly timePickerIncrement = input(1);
  readonly timePickerSeconds = input<Boolean>(false);
  _locale: LocaleConfig = {};
  @Input() set locale(value) {
    this._locale = {...this._localeService.config, ...value};
  }
  get locale(): any {
    return this._locale;
  }
  @Input()
  private _endKey = 'endDate';
  private _startKey = 'startDate';
  @Input() set startKey(value) {
    if (value !== null) {
      this._startKey = value;
    } else {
      this._startKey = 'startDate';
    }
  };
  @Input() set endKey(value) {
    if (value !== null) {
      this._endKey = value;
    } else {
      this._endKey = 'endDate';
    }
  };
  notForChangesProperty: Array<string> = [
    'locale',
    'endKey',
    'startKey'
  ];

  get value() {
    return this._value || null;
  }
  set value(val) {
    this._value = val;
    this._onChange(val);
    this._changeDetectorRef.markForCheck();
  }
  readonly onChange = output<Object>({ alias: 'change' });
  readonly rangeClicked = output<Object>({ alias: 'rangeClicked' });
  readonly datesUpdated = output<Object>({ alias: 'datesUpdated' });

  constructor() {
    const viewContainerRef = this.viewContainerRef;

    this.drops = 'down';
    this.opens = 'right';
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(DaterangepickerComponent);
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    this.picker = (<DaterangepickerComponent>componentRef.instance);
    this.picker.inline = false; // set inline to false for all directive usage
  }
  ngOnInit() {
    this.picker.rangeClicked.asObservable().subscribe((range: any) => {
      this.rangeClicked.emit(range);
    });
    this.picker.datesUpdated.asObservable().subscribe((range: any) => {
      this.datesUpdated.emit(range);
    });
    this.picker.choosedDate.asObservable().subscribe((change: any) => {
      if (change) {
        const value = {};
        value[this._startKey] = change.startDate;
        value[this._endKey] = change.endDate;
        this.value = value;
        this.onChange.emit(value);
        if(typeof change.chosenLabel === 'string') {
          this._el.nativeElement.value = change.chosenLabel;
        }
      }
    });
    this.picker.firstMonthDayClass = this.firstMonthDayClass;
    this.picker.lastMonthDayClass = this.lastMonthDayClass();
    this.picker.emptyWeekRowClass = this.emptyWeekRowClass();
    this.picker.firstDayOfNextMonthClass = this.firstDayOfNextMonthClass();
    this.picker.lastDayOfPreviousMonthClass = this.lastDayOfPreviousMonthClass();
    this.picker.drops = this.drops;
    this.picker.opens = this.opens;
    this.localeDiffer = this.differs.find(this.locale).create();
  }

  ngOnChanges(changes: SimpleChanges): void  {
    for (let change in changes) {
      if (changes.hasOwnProperty(change)) {
        if (this.notForChangesProperty.indexOf(change) === -1) {
          this.picker[change] = changes[change].currentValue;
        }
      }
    }
  }

  ngDoCheck() {
    if (this.localeDiffer) {
      const changes = this.localeDiffer.diff(this.locale);
      if (changes) {
        this.picker.updateLocale(this.locale);
      }
    }
  }

  onBlur() {
    this._onTouched();
  }

  open(event?: any) {
    this.picker.show(event);
    setTimeout(() => {
      this.setPosition();
    });
  }

  hide(e?) {
    this.picker.hide(e);
  }
  toggle(e?) {
    if (this.picker.isShown) {
      this.hide(e);
    } else {
      this.open(e);
    }
  }

  clear() {
    this.picker.clear();
  }

  writeValue(value) {
    this.value = value;
    this.setValue(value);
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  private setValue(val: any) {
    if (val) {
      if (val[this._startKey]) {
        this.picker.setStartDate(val[this._startKey]);
      }
      if (val[this._endKey]) {
        this.picker.setEndDate(val[this._endKey]);
      }
      this.picker.calculateChosenLabel();
      if (this.picker.chosenLabel) {
        this._el.nativeElement.value = this.picker.chosenLabel;
      }
    } else {
      this.picker.clear();
    }
  }
    /**
     * Set position of the calendar
     */
    setPosition() {
      let style;
      let containerTop;
      const container = this.picker.pickerContainer().nativeElement;
      const element = this._el.nativeElement;
      if (this.drops && this.drops == 'up') {
        containerTop = (element.offsetTop - container.clientHeight) + 'px';
      } else {
        containerTop = 'auto';
      }
      if (this.opens == 'left') {
        style = {
            top: containerTop,
            left: (element.offsetLeft - container.clientWidth + element.clientWidth) + 'px',
            right: 'auto'
        };
      } else if (this.opens == 'center') {
          style = {
            top: containerTop,
            left: (element.offsetLeft  +  element.clientWidth / 2
                    - container.clientWidth / 2) + 'px',
            right: 'auto'
          };
      } else {
          style = {
            top: containerTop,
            left: element.offsetLeft  + 'px',
            right: 'auto'
          };
      }
      if (style) {
        this._renderer.setStyle(container, 'top', style.top);
        this._renderer.setStyle(container, 'left', style.left);
        this._renderer.setStyle(container, 'right', style.right);
      }

  }
  /**
   * For click outside of the calendar's container
   * @param event event object
   * @param targetElement target element object
   */
  @HostListener('document:click', ['$event', '$event.target'])
  outsideClick(event, targetElement: HTMLElement): void {
      if (!targetElement) {
        return;
      }
      if (targetElement.classList.contains('ngx-daterangepicker-action')) {
        return;
      }
      const clickedInside = this._el.nativeElement.contains(targetElement);
      if (!clickedInside) {
         this.hide();
      }
  }
}
