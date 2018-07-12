import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// route
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// And Design
import { NgZorroAntdModule } from 'ng-zorro-antd';

// elecreon
import { ElectronService } from './providers/electron.service';

// component
import { AppComponent } from './app.component';
import { HeaderComponent } from "./components/header/header.component";
import { SiderbarComponent } from "./components/siderbar/siderbar.component";
import { WalletComponent } from "./components/wallet/wallet.component";
import { TxSharerComponent } from "./components/txSharer/txSharer.component";
import { TxEdenComponent } from "./components/txEden/txEden.component";
import { WalletNewComponent } from "./components/walletNew/walletNew.component";
import { SharerComponent } from "./components/sharer/sharer.component";
import { DialogComponent } from './components/dialog/dialog.component';
import { InputComponent } from './components/input/input.component';
import { FormComponent } from './components/form/form.component';
import { SettingComponent } from './components/setting/setting.component';
import { TableComponent } from './components/table/table.component';
import { CopyComponent } from './components/copy/copy.component';
import { EdenComponent } from './components/eden/eden.component';

// services


// pipes
import { LongAddrPipe, ShortAddrPipe } from "./pipes/addr.pipe";
import { SafePipe } from './pipes/safe.pipe';
import { NumberPipe, maxNode, E2t } from './pipes/number.pipe';
import { TranserUnitPipe, ShortGNXPipe } from "./pipes/web3Util.pipe";


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    // main component
    AppComponent,
    // nav component
    HeaderComponent,
    SiderbarComponent,
    SettingComponent,
    TableComponent,
    // content component
    EdenComponent,
    WalletComponent,
    TxSharerComponent,
    TxEdenComponent,
    WalletNewComponent,
    SharerComponent,
    // common component
    DialogComponent,
    FormComponent,
    InputComponent,
    CopyComponent,
    // pipe
    LongAddrPipe,
    ShortAddrPipe,
    ShortGNXPipe,
    SafePipe,
    NumberPipe,
    maxNode,
    E2t,
    TranserUnitPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
