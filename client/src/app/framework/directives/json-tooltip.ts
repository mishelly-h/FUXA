import { Directive, Input, ElementRef, HostListener, inject } from '@angular/core';
import { MatTooltip as MatTooltip } from '@angular/material/tooltip';

@Directive({
    selector: '[jsonTooltip]',
    providers: [MatTooltip],
    standalone: false
})
export class JsonTooltipDirective {
  private tooltip = inject(MatTooltip);
  private elementRef = inject(ElementRef);

  @Input('jsonTooltip') tooltipData: any;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipData) {
      this.tooltip.message = this.getObjectString(this.tooltipData);
      this.tooltip.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tooltip.hide();
  }

  private getObjectString(object: any): string {
    const topicString = JSON.stringify(object, null, 4);
    return `${topicString}`;
  }
}
