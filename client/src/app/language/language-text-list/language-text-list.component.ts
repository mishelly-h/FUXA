 
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { MatTable as MatTable, MatTableDataSource as MatTableDataSource, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { ProjectService } from '../../_services/project.service';
import { Language, LanguageText } from '../../_models/language';
import { LanguageTextPropertyComponent } from '../language-text-property/language-text-property.component';
import { LanguageTypePropertyComponent } from '../language-type-property/language-type-property.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatIconButton, MatFabButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';

@Component({
    selector: 'app-language-text-list',
    templateUrl: './language-text-list.component.html',
    styleUrls: ['./language-text-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, NgClass, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFabButton, TranslatePipe]
})
export class LanguageTextListComponent implements OnInit, AfterViewInit, OnDestroy {

    displayedColumns = ['select', 'id', 'group', 'value', 'remove'];
    languages: Language[] = [];
    defaultLanguage: Language;
    dataSource = new MatTableDataSource([]);
    selection = new SelectionModel<Element>(true, []);

    private subscriptionLoad: Subscription;

    @ViewChild(MatTable, { static: false }) table: MatTable<any>;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(public dialog: MatDialog,
        private translateService: TranslateService,
        private projectService: ProjectService) { }

    ngOnInit() {
        this.loadTexts();
        this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(res => {
            this.loadTexts();
        });
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    ngOnDestroy() {
        try {
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
        } catch (e) {
        }
    }

    onAddText() {
        this.editText();
    }

    onEditText(text: LanguageText) {
        this.editText(text);
    }

    onRemoveText(text: LanguageText) {
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            position: { top: '60px' },
            data: <ConfirmDialogData> { msg: this.translateService.instant('msg.texts-text-remove', { value: text.name }) }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.projectService.removeText(text);
                this.loadTexts();
            }
        });
    }

    editText(text?: LanguageText) {
        let dialogRef = this.dialog.open(LanguageTextPropertyComponent, {
            position: { top: '60px' },
            disableClose: true,
            data: { text: text }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.projectService.setText(result);
                this.loadTexts();
            }
        });
    }

    onEditLanguage() {
        let dialogRef = this.dialog.open(LanguageTypePropertyComponent, {
            position: { top: '60px' },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.projectService.setLanguages(result);
                this.loadTexts();
            }
        });
    }

    private loadTexts() {
        const rawLanguages = this.projectService.getLanguages().options;
        this.defaultLanguage = this.projectService.getLanguages().default;
        this.languages = Array.isArray(rawLanguages) ? rawLanguages : Object.values(rawLanguages);

        const valueIndex = this.displayedColumns.indexOf('value');
        const removeIndex = this.displayedColumns.indexOf('remove');

        this.displayedColumns = [
            ...this.displayedColumns.slice(0, valueIndex + 1),
            ...this.languages.map(lang => `lang-${lang.id}`),
            ...this.displayedColumns.slice(removeIndex)
        ];
        const texts = this.projectService.getTexts();
        texts.forEach(text => {
            if (!text.translations) {
                text.translations = {};
            }
            this.languages.forEach(lang => {
                if (!(lang.id in text.translations)) {
                    text.translations[lang.id] = '';
                }
            });
        });
        this.dataSource.data = texts;
    }
}
