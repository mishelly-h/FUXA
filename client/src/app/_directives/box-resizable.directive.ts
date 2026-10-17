import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

export interface BoxResizeEvent {
    size: { width: number; height: number };
}

@Directive({ selector: '[appBoxResizable]' })
export class BoxResizableDirective implements OnInit, OnDestroy {
    @Input() minWidth = 100;
    @Input() minHeight = 60;
    @Output() resizing = new EventEmitter<BoxResizeEvent>();
    @Output() resizeEnd = new EventEmitter<BoxResizeEvent>();

    private handle: HTMLElement;
    private removeHandleListener: () => void;
    private startX = 0;
    private startY = 0;
    private startWidth = 0;
    private startHeight = 0;
    private lastEvent: BoxResizeEvent;

    constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

    ngOnInit() {
        this.handle = this.renderer.createElement('div');
        this.renderer.addClass(this.handle, 'box-resize-handle');
        const style = { position: 'absolute', right: '0', bottom: '0', width: '14px', height: '14px', cursor: 'se-resize', zIndex: '1000', touchAction: 'none' };
        Object.entries(style).forEach(([key, value]) => this.renderer.setStyle(this.handle, key, value));
        this.renderer.appendChild(this.el.nativeElement, this.handle);
        this.removeHandleListener = this.renderer.listen(this.handle, 'pointerdown', (event: PointerEvent) => this.onPointerDown(event));
    }

    private onPointerDown(event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        const bounds = this.el.nativeElement.getBoundingClientRect();
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startWidth = bounds.width;
        this.startHeight = bounds.height;
        this.renderer.addClass(this.el.nativeElement, 'box-resizing');
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    private onPointerMove = (event: PointerEvent) => {
        this.lastEvent = {
            size: {
                width: Math.max(this.minWidth, this.startWidth + event.clientX - this.startX),
                height: Math.max(this.minHeight, this.startHeight + event.clientY - this.startY)
            }
        };
        this.resizing.emit(this.lastEvent);
    };

    private onPointerUp = () => {
        this.detachWindowListeners();
        if (this.lastEvent) {
            this.resizeEnd.emit(this.lastEvent);
            this.lastEvent = null;
        }
    };

    private detachWindowListeners() {
        this.renderer.removeClass(this.el.nativeElement, 'box-resizing');
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    ngOnDestroy() {
        this.detachWindowListeners();
        this.removeHandleListener?.();
    }
}
