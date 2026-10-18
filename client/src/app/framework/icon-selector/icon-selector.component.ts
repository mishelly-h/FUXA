import { Component, Input, OnInit, input, output } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, of } from 'rxjs';
import { Define } from '../../_helpers/define';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { NgStyle, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-icon-selector',
    templateUrl: './icon-selector.component.html',
    styleUrls: ['./icon-selector.component.scss'],
    imports: [MatSelect, NgStyle, MatSelectTrigger, MatIcon, MatOption, MatInput, FormsModule, AsyncPipe, TranslatePipe]
})
export class IconSelectorComponent implements OnInit {
    @Input() value: string;
    readonly valueChange = output<string>();
    readonly selected = output<string>();

    readonly panelWidth = input('310px');
    readonly panelClass = input('icon-selector-panel');
    readonly filterPlaceholder = input('dlg.headeritem-icons-filter');
    readonly width = input('60px');
    readonly height = input('30px');
    @Input() image: string;
    readonly allowImage = input(false);
    readonly allowClear = input(true);
    readonly imageLabel = input('dlg.menuitem-image');
    readonly clearLabel = input('gauges.property-icon-none');
    readonly imageSelected = output<Event>();

    icons$: Observable<string[]>;
    filteredIcons$: Observable<string[]>;
    filterText = '';
    private filterTextSubject = new BehaviorSubject<string>('');

    ngOnInit() {
        this.icons$ = of(Define.MaterialIconsRegular).pipe(
            map((data: string) => data.split('\n')),
            map(lines => lines.map(line => line.split(' ')[0])),
            map(names => names.filter(name => !!name))
        );

        this.filteredIcons$ = combineLatest([
            this.icons$,
            this.filterTextSubject.asObservable()
        ]).pipe(
            map(([icons, filterText]) =>
                icons.filter(icon => icon.toLowerCase().includes(filterText.toLowerCase()))
            )
        );
    }

    onFilterChange() {
        this.filterTextSubject.next(this.filterText);
    }

    onSelect(icon: string) {
        this.value = icon;
        this.valueChange.emit(icon);
        this.selected.emit(icon);
    }

    onClear() {
        this.value = '';
        this.image = undefined;
        this.valueChange.emit('');
        this.selected.emit('');
    }

    onImageSelected(event: Event) {
        this.value = 'image';
        this.valueChange.emit(this.value);
        this.imageSelected.emit(event);
    }
}
