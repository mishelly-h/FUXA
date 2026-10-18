import { ChangeDetectorRef, Component, Input, inject, input, output } from '@angular/core';
import { MatDialog as MatDialog } from '@angular/material/dialog';

import { PermissionData, PermissionDialogComponent, PermissionMode } from '../permission-dialog/permission-dialog.component';
import { PermissionRoles } from '../../../_models/hmi';
import { SettingsService } from '../../../_services/settings.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'flex-auth',
    templateUrl: './flex-auth.component.html',
    styleUrls: ['./flex-auth.component.css'],
    imports: [FormsModule, MatIcon, TranslatePipe]
})
export class FlexAuthComponent {
    dialog = inject(MatDialog);
    private settingsService = inject(SettingsService);
    private cdr = inject(ChangeDetectorRef);


    @Input() name: string;
    @Input() permission: number;
    @Input() permissionRoles: PermissionRoles;
    readonly permissionMode = input<PermissionMode>(undefined);
    readonly onChanged = output<FlexAuthValues>();

    onEditPermission() {
        let permission = this.permission;
        let dialogRef = this.dialog.open(PermissionDialogComponent, {
            position: { top: '60px' },
            data: <PermissionData>{
                permission: permission,
                permissionRoles: this.permissionRoles,
                mode: this.permissionMode()
            }
        });

        dialogRef.afterClosed().subscribe((result: PermissionData) => {
            if (result) {
                this.permission = result.permission;
                this.permissionRoles = result.permissionRoles;
                this.onEmitValues();
            }
            this.cdr.detectChanges();
        });
    }

    getResult(): FlexAuthValues {
        return {
            name: this.name,
            permission: this.permission,
            permissionRoles: this.permissionRoles
        };
    }

    onEmitValues() {
        this.onChanged.emit(this.getResult());
    }


    isRolePermission() {
        return this.settingsService.getSettings()?.userRole;
    }

    havePermission() {
        if (this.isRolePermission()) {
            return this.permissionRoles?.show?.length || this.permissionRoles?.enabled?.length;
        } else {
            return this.permission;
        }
    }
}

export interface FlexAuthValues {
    name: string;
    permission?: number;
    permissionRoles?: {
        show: string[];
        enabled: string[];
    };
}
