import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, inject, viewChild } from '@angular/core';
import { Role, UserGroups } from '../../../_models/user';
import { SelOptionType, SelOptionsComponent } from '../../../gui-helpers/sel-options/sel-options.component';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SettingsService } from '../../../_services/settings.service';
import { UserService } from '../../../_services/user.service';
import { Subject, map, takeUntil } from 'rxjs';
import { DialogDraggableDirective } from '../../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-permission-dialog',
    templateUrl: './permission-dialog.component.html',
    styleUrls: ['./permission-dialog.component.scss'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, SelOptionsComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class PermissionDialogComponent implements AfterViewInit, OnDestroy {
    dialogRef = inject<MatDialogRef<PermissionDialogComponent>>(MatDialogRef);
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef);
    private settingsService = inject(SettingsService);
    data = inject<PermissionData>(MAT_DIALOG_DATA);

    selected = [];
    extension = [];
    options = [];
    private destroy$ = new Subject<void>();

    readonly seloptions = viewChild(SelOptionsComponent);

    ngAfterViewInit() {
        if (this.isRolePermission()) {
            this.userService.getRoles().pipe(
                map(roles => roles.sort((a, b) => a.index - b.index)),
                takeUntil(this.destroy$)
            ).subscribe((roles: Role[]) => {
                this.options = roles?.map(role => <SelOptionType>{ id: role.id, label: role.name });
                this.selected = this.options.filter(role => this.data.permissionRoles?.enabled?.includes(role.id));
                this.extension = this.data.mode ? null : this.options.filter(role => this.data.permissionRoles?.show?.includes(role.id));
            }, err => {
                console.error('get Roles err: ' + err);
            });
        } else {
            this.selected = UserGroups.ValueToGroups(this.data.permission);
            this.extension = this.data.mode ? null : UserGroups.ValueToGroups(this.data.permission, true);
            this.options = UserGroups.Groups;
        }
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
		this.destroy$.next(null);
        this.destroy$.complete();
	}

    isRolePermission() {
        return this.settingsService.getSettings()?.userRole;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.isRolePermission()) {
            if (!this.data.permissionRoles) {
                this.data.permissionRoles = { show: null, enabled: null };
            }
            const seloptions = this.seloptions();
            this.data.permissionRoles.enabled = seloptions.selected?.map(role => role.id);
            if (this.data.mode === 'onlyShow') {
                this.data.permissionRoles.show = seloptions.selected?.map(role => role.id);
            } else {
                this.data.permissionRoles.show = seloptions.extSelected?.map(role => role.id);
            }

        } else {
            this.data.permission = UserGroups.GroupsToValue(this.seloptions().selected);
            if (this.data.mode === 'onlyShow') {
                this.data.permission += UserGroups.GroupsToValue(this.seloptions().selected, true);
            } else {
                this.data.permission += UserGroups.GroupsToValue(this.seloptions().extSelected, true);
            }
        }
        this.dialogRef.close(this.data);
    }
}

export interface PermissionData {
    permission: number;
    permissionRoles: {
        show: string[];
        enabled: string[];
    };
    mode?: PermissionMode;
}

export type PermissionMode = 'onlyShow' | 'onlyEnable';
