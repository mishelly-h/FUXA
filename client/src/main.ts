import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/lint/lint';
import { ResClientService } from './app/_services/rcgi/resclient.service';
import { ResWebApiService } from './app/_services/rcgi/reswebapi.service';
import { ResDemoService } from './app/_services/rcgi/resdemo.service';
import { HmiService } from './app/_services/hmi.service';
import { RcgiService } from './app/_services/rcgi/rcgi.service';
import { AppService } from './app/_services/app.service';
import { ProjectService } from './app/_services/project.service';
import { UserService } from './app/_services/user.service';
import { DiagnoseService } from './app/_services/diagnose.service';
import { CommandService } from './app/_services/command.service';
import { HeartbeatService } from './app/_services/heartbeat.service';
import { DataConverterService } from './app/_services/data-converter.service';
import { ScriptService } from './app/_services/script.service';
import { ResourcesService } from './app/_services/resources.service';
import { PluginService } from './app/_services/plugin.service';
import { SettingsService } from './app/_services/settings.service';
import { TesterService } from './app/tester/tester.service';
import { httpInterceptorProviders } from './app/_helpers/auth-interceptor';
import { AuthService } from './app/_services/auth.service';
import { GaugesManager } from './app/gauges/gauges.component';
import { WindowRef } from './app/_helpers/windowref';
import { Utils } from './app/_helpers/utils';
import { SvgUtils } from './app/_helpers/svg-utils';
import { Calc } from './app/_helpers/calc';
import { HtmlSwitchComponent } from './app/gauges/controls/html-switch/html-switch.component';
import { PipeComponent } from './app/gauges/controls/pipe/pipe.component';
import { SliderComponent } from './app/gauges/controls/slider/slider.component';
import { HtmlTableComponent } from './app/gauges/controls/html-table/html-table.component';
import { Dictionary } from './app/_helpers/dictionary';
import { ModalPositionCache } from './app/_directives/modal-position.cache';
import { Define } from './app/_helpers/define';
import { AuthGuard } from './app/auth.guard';
import { ToastNotifierService } from './app/_services/toast-notifier.service';
import { MyFileService } from './app/_services/my-file.service';
import { ReportsService } from './app/_services/reports.service';
import { ActionPropertyService } from './app/gauges/gauge-property/action-properties-dialog/action-property.service';
import { MapsLocationsService } from './app/_services/maps-locations.service';
import { LanguageService } from './app/_services/language.service';
import { DeviceAdapterService } from './app/device-adapter/device-adapter.service';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './app/app.routing';
import { MaterialModule } from './app/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgxDaterangepickerMd } from './app/gui-helpers/daterangepicker';
import { AppComponent } from './app/app.component';

const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
    showDelay: 2000,
    hideDelay: 500,
    touchendHideDelay: 500,
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule, routing, MaterialModule, BrowserAnimationsModule, DragDropModule, ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: false
        }), CodemirrorModule, NgxDaterangepickerMd.forRoot()),
        // providersResourceService,
        ResClientService,
        ResWebApiService,
        ResDemoService,
        HmiService,
        RcgiService,
        AppService,
        ProjectService,
        UserService,
        DiagnoseService,
        CommandService,
        HeartbeatService,
        DataConverterService,
        ScriptService,
        ResourcesService,
        PluginService,
        SettingsService,
        TesterService,
        httpInterceptorProviders,
        AuthService,
        GaugesManager,
        WindowRef,
        Utils,
        SvgUtils,
        Calc,
        HtmlSwitchComponent,
        PipeComponent,
        SliderComponent,
        HtmlTableComponent,
        Dictionary,
        ModalPositionCache,
        Define,
        AuthGuard,
        ToastNotifierService,
        MyFileService,
        ReportsService,
        ActionPropertyService,
        MapsLocationsService,
        LanguageService,
        DeviceAdapterService,
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideCharts(withDefaultRegisterables()),
        provideTranslateService({
            loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' })
        })
    ]
})
  .catch(err => console.log(err));
