import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class ToastNotifierService {
    private translateService = inject(TranslateService);
    private toastr = inject(ToastrService);


    notifyError(msgKey: string, err = '', closeButton = true, disableTimeOut = true) {
        this.translateService.get(msgKey).subscribe((txt: string) => {
            this.toastr.error(`${txt} ${err}`, '', {
                timeOut: 3000,
                closeButton: closeButton,
                disableTimeOut: disableTimeOut
            });
        });
    }
}
