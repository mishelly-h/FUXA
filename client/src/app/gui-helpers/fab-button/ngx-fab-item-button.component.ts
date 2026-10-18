import {
  Component,
  Input,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  viewChild,
  output
} from '@angular/core';

@Component({
    selector: 'ngx-fab-item-button',
    styles: [`
  .item {
    /* width:40px; */
    height: 36px;
    left: 3px;
    /* left: -3px; */
    transform: translate3d(0, 0, 0);
    transition: transform, opacity ease-out 200ms;
    transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    transition-duration: 180ms;
    position: absolute;
    cursor: pointer;
    top:5px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 9999;
  }
  .item.disabled {
    pointer-events: none;
  }
  .item.disabled .fab-item {
    background-color: lightgray;
  }
  .content {
    z-index: 9999;
    background: rgba(68,138,255, 1);
    margin-left: 0px;
    line-height: 25px;
    color: white;
    /* text-transform: lowercase; */
    padding: 5px 20px 3px 20px;
    border-top-right-radius: 18px;
    border-bottom-right-radius: 18px;
    border-bottom-left-radius: 18px;
    border-top-left-radius: 18px;
    display: none;
    font-size: 13px;
    height: 28px;
    /* margin-top: 4px; */
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.26);
    white-space:nowrap;
  }
  .fab-item {
    left: 0;
    background: rgba(68,138,255, 1);
    border-radius: 100%;
    width: 36px;
    height: 36px;
    position: absolute;
    color: white;
    text-align: center;
    cursor: pointer;
    line-height: 50px;
    /* box-shadow: 0 2px 5px 0 rgba(0,0,0,.26); */
  }
  .fab-item-ex {
    top: 0;
    background: rgba(68,138,255, 1);
    border-radius: 100%;
    width: 36px;
    height: 36px;
    position: absolute;
    color: white;
    text-align: center;
    cursor: pointer;
    line-height: 45px;
    /* box-shadow: 0 2px 5px 0 rgba(0,0,0,.26); */
  }
  .fab-item img {
    padding-bottom: 2px;
    padding-left: 5px;
  }
  `],
    template: `
    <div #elementref class="item {{ disabled() ? 'disabled' : ''}}"
    (click)="emitClickEvent($event)">
        <a class="fab-item" [style.backgroundColor]="color()">
          @if (svgicon) {
<img src="{{svgicon}}"/>
}
          @if (!svgicon) {
<i class="material-icons"> {{ icon() }} </i>
}
        </a>
        <div class="content-wrapper" #contentref>
          <div class="content" [style.display]="content() ? 'block' : 'none'" [style.padding-right]="iconex ? '28px' : '20px'">{{content()}}
            @if (iconex) {
<a class="fab-item-ex" [style.backgroundColor]="color()" (click)="stopPropagation($event);emitClickExEvent($event)">
                <i class="material-icons" style="font-size: 18px"> {{ iconex }} </i>
            </a>
}
          </div>
        </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NgxFabItemButtonComponent {
    readonly icon = input<string>(undefined);
    @Input() svgicon: string;
    @Input() iconex: string;
    readonly svgiconex = input<string>(undefined);
    readonly content = input<string>(undefined);
    readonly color = input('white');
    readonly clicked = output<any>();
    readonly exclicked = output<any>();
    readonly disabled = input(false);
    readonly elementref = viewChild<ElementRef<HTMLElement>>('elementref');
    readonly contentref = viewChild<ElementRef<HTMLElement>>('contentref');
    timeout: ReturnType<typeof setTimeout>;

    emitClickEvent($event: Event) {
        const disabled = this.disabled();
        if (disabled) {
            return disabled;
        }
        this.clicked.emit($event);
    }
    emitClickExEvent($event: Event) {
        const disabled = this.disabled();
        if (disabled) {
            return disabled;
        }
        this.exclicked.emit($event);
    }

    public stopPropagation($event: Event) {
        $event.stopPropagation();
    }
}
