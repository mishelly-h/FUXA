import { Component, ElementRef, OnInit, inject, input, viewChild, output } from '@angular/core';
import Player from 'xgplayer';
import LivePreset from 'xgplayer/es/presets/live';
import FlvJsPlugin from 'xgplayer-flv.js';
import { WebcamPlayerDialogData } from './webcam-player-dialog/webcam-player-dialog.component';
import { Utils } from '../../_helpers/utils';
import { HmiService } from '../../_services/hmi.service';

@Component({
    selector: 'app-webcam-player',
    templateUrl: './webcam-player.component.html',
    styleUrls: ['./webcam-player.component.css'],
    standalone: false
})
export class WebcamPlayerComponent implements OnInit {
    private hmiService = inject(HmiService);


    readonly xgplayerRef = viewChild<ElementRef>('xgplayer');
    readonly data = input<WebcamPlayerDialogData>(undefined);
    readonly onclose = output();
    player: Player;

    ngOnInit(): void {
        let url = this.data().ga.property.variableValue;
        const data = this.data();
        if (data.ga.property.variableId){
            let variable = this.hmiService.getMappedVariable(data.ga.property.variableId, false);
            if (!Utils.isNullOrUndefined(variable?.value)) {
                url = '' + variable.value;
            }
        }
        let plugins: any = [];
        //add http-flv support
        if (new URL(url).pathname.endsWith('flv')) {
            plugins.push(FlvJsPlugin);
        }
        this.player = new Player({
            el: this.xgplayerRef().nativeElement,
            url,
            autoplay: true,
            presets: [LivePreset],
            plugins
        });
    }

    private onClose($event) {
        if (this.onclose) {
            this.onclose.emit($event);
        }
    }
}
