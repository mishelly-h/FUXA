import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

export interface BoxResizeEvent {
    size: { width: number; height: number };
}

@Directive({
    selector: '[appBoxResizable]',
    standalone: false
})
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
    private scaleX = 1;
    private scaleY = 1;
    private activePointerId: number | null = null;
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
        const element = this.el.nativeElement;
        const bounds = element.getBoundingClientRect();
        this.activePointerId = event.pointerId;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startWidth = element.offsetWidth;
        this.startHeight = element.offsetHeight;
        const scaleX = bounds.width / element.offsetWidth;
        const scaleY = bounds.height / element.offsetHeight;
        this.scaleX = Number.isFinite(scaleX) && scaleX !== 0 ? scaleX : 1;
        this.scaleY = Number.isFinite(scaleY) && scaleY !== 0 ? scaleY : 1;
        this.renderer.addClass(element, 'box-resizing');
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerCancel);
    }

    private onPointerMove = (event: PointerEvent) => {
        if (event.pointerId !== this.activePointerId) {
            return;
        }
        this.lastEvent = {
            size: {
                width: Math.max(this.minWidth, this.startWidth + (event.clientX - this.startX) / this.scaleX),
                height: Math.max(this.minHeight, this.startHeight + (event.clientY - this.startY) / this.scaleY)
            }
        };
        this.resizing.emit(this.lastEvent);
    };

    private onPointerUp = (event: PointerEvent) => {
        if (event.pointerId !== this.activePointerId) {
            return;
        }
        this.detachWindowListeners();
        if (this.lastEvent) {
            this.resizeEnd.emit(this.lastEvent);
            this.lastEvent = null;
        }
        this.activePointerId = null;
    };

    private onPointerCancel = (event: PointerEvent) => {
        if (event.pointerId !== this.activePointerId) {
            return;
        }
        if (this.lastEvent) {
            this.resizing.emit({ size: { width: this.startWidth, height: this.startHeight } });
        }
        this.lastEvent = null;
        this.activePointerId = null;
        this.detachWindowListeners();
    };

    private detachWindowListeners() {
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerCancel);
        this.renderer.removeClass(this.el.nativeElement, 'box-resizing');
    }

    ngOnDestroy() {
        this.detachWindowListeners();
        this.removeHandleListener?.();
    }
}
