import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { MatTooltip as MatTooltip } from '@angular/material/tooltip';

@Directive({
    selector: '[jsonTooltip]',
    providers: [MatTooltip]
})
export class JsonTooltipDirective {
  private tooltip = inject(MatTooltip);
  private elementRef = inject(ElementRef);

  readonly tooltipData = input<any>(undefined, { alias: "jsonTooltip" });

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const tooltipData = this.tooltipData();
    if (tooltipData) {
      this.tooltip.message = this.getObjectString(tooltipData);
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
