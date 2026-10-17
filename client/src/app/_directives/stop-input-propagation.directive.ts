import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[stopInputPropagation]',
    standalone: false
})
export class StopInputPropagationDirective implements AfterViewInit  {

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    const container = this.elementRef.nativeElement;
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {

      input.addEventListener('keydown', (event: Event) => {
        event.stopPropagation();
      });
    });
  }
}
