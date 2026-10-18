import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[stopInputPropagation]',
    standalone: false
})
export class StopInputPropagationDirective implements AfterViewInit  {
  private elementRef = inject(ElementRef);


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
