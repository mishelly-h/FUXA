import { AfterViewInit, Component, OnInit, inject, viewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { Role } from '../../_models/user';
import { MatDialog as MatDialog} from '@angular/material/dialog';
import { UsersRoleEditComponent } from '../users-role-edit/users-role-edit.component';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UserService } from '../../_services/user.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../../gui-helpers/confirm-dialog/confirm-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatIconButton, MatFabButton } from '@angular/material/button';

@Component({
    selector: 'app-user-roles',
    templateUrl: './users-roles.component.html',
    styleUrls: ['./users-roles.component.scss'],
    imports: [MatIcon, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, NgClass, MatIconButton, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFabButton, TranslatePipe]
})
export class UsersRolesComponent implements OnInit, AfterViewInit {
    private dialog = inject(MatDialog);
    private translateService = inject(TranslateService);
    private userService = inject(UserService);


    displayedColumns = ['select', 'index', 'name', 'description', 'remove'];
    dataSource = new MatTableDataSource([]);

	roles: Role[];

    readonly table = viewChild(MatTable);
	readonly sort = viewChild(MatSort);

    ngOnInit() {
		this.loadRoles();
    }

    ngAfterViewInit() {
		this.dataSource.sort = this.sort();
	}

    onAddRole() {
		let role = new Role();
		this.editRole(role);
	}

    onEditRole(role: Role) {
		this.editRole(role);
	}

    onRemoveRole(role: Role) {
        let msg = this.translateService.instant('msg.role-remove', { value: role.name });
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { msg: msg },
            position: { top: '60px' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && role) {
                this.userService.removeRole(role).subscribe(result => {
                    this.loadRoles();
                }, err => {
			        console.error('remove Roles err: ' + err);
                });
            }
        });
	}

    private loadRoles() {
		this.roles = [];
		this.userService.getRoles().subscribe(result => {
			Object.values<Role>(result).forEach(role => {
				this.roles.push(role);
			});
			this.bindToTable(this.roles);
		}, err => {
			console.error('get Roles err: ' + err);
		});
	}

    private editRole(role: Role) {
		let mrole: Role = JSON.parse(JSON.stringify(role));
		let dialogRef = this.dialog.open(UsersRoleEditComponent, {
			position: { top: '60px' },
			data: mrole
		});
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
                this.userService.setRole(result).subscribe(result => {
                    this.loadRoles();
                }, err => {
			        console.error('set Roles err: ' + err);
                });
			}
		}, err => {
		});
	}

    private bindToTable(roles: Role[]) {
		this.dataSource.data = roles;
	}
}
