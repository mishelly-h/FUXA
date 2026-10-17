import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ScriptMode, SystemFunctions } from '../../_models/script';
import { ProjectService } from '../../_services/project.service';
import { ClientAccess } from '../../_models/client-access';
import { DialogDraggableDirective } from '../../_directives/dialog-draggable.directive';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-client-script-access',
    templateUrl: './client-script-access.component.html',
    styleUrls: ['./client-script-access.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDialogTitle, DialogDraggableDirective, MatIcon, CdkScrollable, MatDialogContent, MatSlideToggle, FormsModule, MatTooltip, MatDialogActions, MatButton, TranslatePipe]
})
export class ClientScriptAccessComponent implements OnInit {

    scriptFunctions: ScriptFunctionAccess[] = [];

    constructor(
        private dialogRef: MatDialogRef<ClientScriptAccessComponent>,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        const systemFunctions  = new SystemFunctions(ScriptMode.CLIENT);
        const accessConfig: ClientAccess = this.projectService.getClientAccess();

        this.scriptFunctions  = systemFunctions.functions.map(fnc => ({
            name: fnc.name,
            label: fnc.text,
            tooltip: fnc.tooltip,
            enabled: accessConfig?.scriptSystemFunctions?.includes(fnc.name) ?? false
        }));
    }

    getClientAccess(): ClientAccess {
        return {
            scriptSystemFunctions: this.scriptFunctions
                .filter(f => f.enabled)
                .map(f => f.name)
        };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close();
        const updatedAccess = this.getClientAccess();
        this.projectService.setClientAccess(updatedAccess);
    }
}

interface ScriptFunctionAccess {
    name: string;
    label: string;
    tooltip?: string;
    enabled: boolean;
}
