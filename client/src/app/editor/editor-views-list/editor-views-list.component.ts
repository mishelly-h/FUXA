import { Component, Input, inject, input, output } from '@angular/core';
import { View, ViewType } from '../../_models/hmi';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../_services/project.service';
import { ViewPropertyComponent, ViewPropertyType } from '../view-property/view-property.component';
import * as FileSaver from 'file-saver';
import { EditNameComponent, EditNameData } from '../../gui-helpers/edit-name/edit-name.component';

@Component({
    selector: 'app-editor-views-list',
    templateUrl: './editor-views-list.component.html',
    styleUrls: ['./editor-views-list.component.scss'],
    standalone: false
})
export class EditorViewsListComponent {
    private projectService = inject(ProjectService);
    private translateService = inject(TranslateService);
    dialog = inject(MatDialog);


    readonly views = input<View[]>([]);
    @Input('select') set select(view: View) {
        this.currentView = view;
    };
    readonly selected = output<View>();
    readonly viewPropertyChanged = output<View>();
    readonly cloneView = output<View>();

    currentView: View = null;

    cardViewType = ViewType.cards;
    svgViewType = ViewType.svg;
    mapsViewType = ViewType.maps;

    onSelectView(view: View, force = true) {
        if (!force && this.currentView?.id === view?.id) {
            return;
        }
        this.currentView = view;
        this.selected.emit(this.currentView);
    }

    getViewsSorted() {
        return this.views().sort((a, b) => {
            if (a.name > b.name) { return 1; }
            return -1;
        });
    }

    isViewActive(view) {
        return (this.currentView && this.currentView.name === view.name);
    }

    onDeleteView(view) {
        let msg = '';
        this.translateService.get('msg.view-remove', { value: view.name }).subscribe((txt: string) => { msg = txt; });
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            position: { top: '60px' },
            data: <ConfirmDialogData> { msg: this.translateService.instant('msg.view-remove', { value: view.name }) }
        });

        dialogRef.afterClosed().subscribe(result => {
            const views = this.views();
            if (result && views) {
                let toselect = null;
                for (var i = 0; i < views.length; i++) {
                    if (views[i].id === view.id) {
                        views.splice(i, 1);
                        if (i > 0 && i < views.length) {
                            toselect = views[i];
                        }
                        break;
                    }
                }
                this.currentView = null;
                if (toselect) {
                    this.onSelectView(toselect);
                } else if (views.length > 0) {
                    this.onSelectView(views[0]);
                }
                this.projectService.removeView(view);
            }
        });
    }

    onRenameView(view) {
        let exist = this.views().filter((v) => v.id !== view.id).map((v) => v.name);
        let dialogRef = this.dialog.open(EditNameComponent, {
            disableClose: true,
            position: { top: '60px' },
            data: <EditNameData> {
                title: this.translateService.instant('dlg.docname-title'),
                name: view.name,
                exist: exist
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.name) {
                view.name = result.name;
                this.projectService.setView(view, false);
            }
        });
    }

    onPropertyView(view) {
        let dialogRef = this.dialog.open(ViewPropertyComponent, {
            position: { top: '60px' },
            disableClose: true,
            data: <ViewPropertyType> {
                name: view.name,
                type: view.type || ViewType.svg,
                profile: view.profile,
                property: view.property}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.profile) {
                if (result.profile.height) {view.profile.height = parseInt(result.profile.height);}
                if (result.profile.width) {view.profile.width = parseInt(result.profile.width);}
                if (result.profile.margin >= 0) {view.profile.margin = parseInt(result.profile.margin);}
                view.profile.bkcolor = result.profile.bkcolor;
                if (result.property?.events) {
                    view.property ??= { events: [], actions: [] };
                    view.property.events = result.property.events;
                }
                this.viewPropertyChanged.emit(view);
                this.onSelectView(view);
            }
        });
    }

    onCloneView(view: View) {
        this.cloneView.emit(view);
    }

    onExportView(view: View) {
        let filename = `${view.name}.json`;
        let content = JSON.stringify(view);
        let blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, filename);
    }

    onCleanView(view: View) {
       const changed = this.projectService.cleanView(view);
       if (changed) {
            this.onSelectView(view);
       }
    }
}
