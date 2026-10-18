import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { RcgiService } from './rcgi/rcgi.service';
import { ResourceStorageService } from './rcgi/resource-storage.service';

@Injectable({
    providedIn: 'root'
})
export class CommandService {
	private rcgiService = inject(RcgiService);
	private translateService = inject(TranslateService);
	private toastr = inject(ToastrService);


	private server: ResourceStorageService;

    constructor() {
        const rcgiService = this.rcgiService;


        this.server = rcgiService.rcgi;
    }

    getReportFile(reportName: string): Observable<Blob> {
        return  this.server.downloadFile(reportName, CommanType.reportDownload);
    }

    private notifyError(err: any) {
        var msg = '';
        this.translateService.get('msg.report-build-error').subscribe((txt: string) => { msg = txt; });
        this.toastr.error(msg, '', {
            timeOut: 3000,
            closeButton: true,
            disableTimeOut: true
        });
    }
}

export enum CommanType {
    reportDownload = 'REPORT-DOWNLOAD'
};
