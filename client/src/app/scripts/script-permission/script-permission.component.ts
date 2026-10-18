import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, viewChild } from '@angular/core';
import { SelOptionType, SelOptionsComponent } from '../../gui-helpers/sel-options/sel-options.component';
import { Role, UserGroups } from '../../_models/user';
import { SettingsService } from '../../_services/settings.service';
import { UserService } from '../../_services/user.service';
import { Subject, map, takeUntil } from 'rxjs';
import { UserInfo } from '../../users/user-edit/user-edit.component';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-script-permission',
    templateUrl: './script-permission.component.html',
    styleUrls: ['./script-permission.component.css'],
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, SelOptionsComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class ScriptPermissionComponent implements OnInit, OnDestroy {
    dialogRef = inject<MatDialogRef<ScriptPermissionComponent>>(MatDialogRef);
    data = inject<ScriptPermissionData>(MAT_DIALOG_DATA);
    private cdr = inject(ChangeDetectorRef);
    private userService = inject(UserService);
    private settingsService = inject(SettingsService);


    userInfo: UserInfo;
    selected = [];
    options = [];
	readonly seloptions = viewChild(SelOptionsComponent);
    private destroy$ = new Subject<void>();

	ngOnInit() {
        if (this.isRolePermission()) {
            this.userService.getRoles().pipe(
                map(roles => roles.sort((a, b) => a.index - b.index)),
                takeUntil(this.destroy$)
            ).subscribe((roles: Role[]) => {
                this.options = roles?.map(role => <SelOptionType>{ id: role.id, label: role.name });
                this.selected = this.options.filter(role => this.data.permissionRoles?.enabled?.includes(role.id));
            }, err => {
                console.error('get Roles err: ' + err);
            });
        } else {
            this.selected = UserGroups.ValueToGroups(this.data.permission);
            this.options = UserGroups.Groups;
        }
        this.cdr.detectChanges();
    }

	ngOnDestroy() {
		this.destroy$.next(null);
        this.destroy$.complete();
	}

  	onNoClick(): void {
		this.dialogRef.close();
	}

	onOkClick(): void {
		let result = <ScriptPermissionData>{
			permission: null,
			permissionRoles: { enabled: null }
		};
        const seloptions = this.seloptions();
        if (seloptions) {
            if (this.isRolePermission()) {
                result.permissionRoles.enabled = seloptions.selected?.map(role => role.id);
            } else {
                result.permission = UserGroups.GroupsToValue(seloptions.selected);
            }
        }
		this.dialogRef.close(result);
	}

	isRolePermission() {
        return this.settingsService.getSettings()?.userRole;
    }
}

export interface ScriptPermissionData {
	permission: number;
	permissionRoles: {
        enabled: string[];
    };
}
