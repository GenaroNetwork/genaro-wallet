import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LMarkdownEditorModule } from "ngx-markdown-editor";

// route
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// And Design
import { IconDefinition } from '@ant-design/icons-angular';
import { NgZorroAntdModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS } from 'ng-zorro-antd';
import * as AllIcons from '@ant-design/icons-angular/icons';
const antDesignIcons = AllIcons as { [key: string]: IconDefinition; };
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])


// elecreon
import { ElectronService } from './providers/electron.service';

// services


// pipes
import { LongAddrPipe, ShortAddrPipe, GetWalletPipe } from './pipes/addr.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { TranserUnitPipe, ShortGNXPipe } from './pipes/web3Util.pipe';
import { SpecialTxPipe, maxNodePipe } from './pipes/transaction.pipe';
import { HumanSizePipe } from './pipes/human.pipe';
import { TablePipe } from './pipes/table.pipe';
import { FormatSentinelPipe } from './pipes/formatSentinel.pipe';
import { FormatSizePipe } from './pipes/formatSize.pipe';
import { EdenFileReceiveComponent } from './components/edenFileReceive/edenFileReceive.component';
import { EdenFileShareComponent } from './components/edenFileShare/edenFileShare.component';

// component
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SiderbarComponent } from './components/siderbar/siderbar.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { TxSharerComponent } from './components/txSharer/txSharer.component';
import { TxEdenComponent } from './components/txEden/txEden.component';
import { WalletNewComponent } from './components/walletNew/walletNew.component';
import { SharerComponent } from './components/sharer/sharer.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { InputComponent } from './components/input/input.component';
import { FormComponent } from './components/form/form.component';
import { TableComponent } from './components/table/table.component';
import { CopyComponent } from './components/copy/copy.component';
import { EdenComponent } from './components/eden/eden.component';
import { TaskComponent } from './components/task/task.component';
import { CommitteeComponent } from './components/committee/committee.component';
import { CurrentCommitteeComponent } from './components/currentCommittee/currentCommittee.component';
import { JoinCommitteeComponent } from './components/joinCommittee/joinCommittee.component';
import { PanelComponent } from './components/panel/panel.component';
import { DownloadMinerComponent } from './components/downloadMiner/downloadMiner.component';
import { MailComponent } from './components/mail/mail.component';


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
    TableComponent,
    // content component
    EdenComponent,
    EdenFileShareComponent,
    EdenFileReceiveComponent,
    MailComponent,
    WalletComponent,
    TxSharerComponent,
    TxEdenComponent,
    WalletNewComponent,
    SharerComponent,
    TaskComponent,
    CommitteeComponent,
    CurrentCommitteeComponent,
    JoinCommitteeComponent,
    // common component
    DialogComponent,
    FormComponent,
    InputComponent,
    CopyComponent,
    PanelComponent,
    DownloadMinerComponent,
    // pipe
    LongAddrPipe,
    ShortAddrPipe,
    ShortGNXPipe,
    SafePipe,
    maxNodePipe,
    TranserUnitPipe,
    SpecialTxPipe,
    HumanSizePipe,
    TablePipe,
    FormatSentinelPipe,
    FormatSizePipe,
    GetWalletPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    LMarkdownEditorModule,
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
    { provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#00ff00' },
    { provide: NZ_ICONS, useValue: icons },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
