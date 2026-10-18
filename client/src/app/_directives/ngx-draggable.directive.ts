import { Directive, ElementRef, Renderer2, OnDestroy, OnInit, AfterViewInit, Input, inject, input } from '@angular/core';


@Directive({
    selector: '[draggable]',
    host: {
        '(dragstart)': 'onDragStart($event)',
        '(dragend)': 'onDragEnd($event)',
        '(drag)': 'onDrag($event)'
    }
})
export class DraggableDirective implements OnDestroy, OnInit, AfterViewInit {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);

    private dx = 0;
    private dy = 0;

    private canDrag = '';
    private active = false;

    @Input('draggable')
    set draggable(val: any) {
        if (val === undefined || val === null || val === '') {return;}
        this.canDrag = val;
    }
    readonly draggableHeight = input<number>(undefined);

    private mustBePosition: Array<string> = ['absolute', 'fixed', 'relative'];

    ngOnInit(): void {
        this.renderer.setAttribute(this.el.nativeElement, 'draggable', 'true');
    }
    ngAfterViewInit() {
        try {
            let position = window.getComputedStyle(this.el.nativeElement).position;
            if (this.mustBePosition.indexOf(position) === -1) {
                console.warn(this.el.nativeElement, 'Must be having position attribute set to ' + this.mustBePosition.join('|'));
            }
        } catch (ex) {
            console.error(ex);
        }
    }
    ngOnDestroy(): void {
        this.renderer.setAttribute(this.el.nativeElement, 'draggable', 'false');
    }

    onDragStart(event: any) {
        event.dataTransfer.setData('text/plain', event.target.id);
        this.active = false;
        const draggableHeight = this.draggableHeight();
        if (draggableHeight && draggableHeight < event.offsetY) {
            return;
        }
        this.active = true;
        this.dx = event.x - this.el.nativeElement.offsetLeft;
        this.dy = event.y - this.el.nativeElement.offsetTop;
    }

    onDrag(event: MouseEvent) {
        if (!this.active) {
            return;
        }
        this.doTranslation(event.x, event.y);
    }

    onDragEnd(event: MouseEvent) {
        if (!this.active) {
            return;
        }
        this.dx = 0;
        this.dy = 0;
    }

    doTranslation(x: number, y: number) {
        if (!x || !y) {return;}
        this.renderer.setStyle(this.el.nativeElement, 'top', (y - this.dy) + 'px');
        this.renderer.setStyle(this.el.nativeElement, 'left', (x - this.dx) + 'px');
    }
}
