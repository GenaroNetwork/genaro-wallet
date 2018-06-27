import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// route
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// element
import { ElModule } from 'element-angular';
import { ElectronService } from './providers/electron.service';
import { WebviewDirective } from './directives/webview.directive';

// component
import { AppComponent } from './app.component';
import { HeaderComponent } from "./components/header/header.component";
import { SiderbarComponent } from "./components/siderbar/siderbar.component";
import { WalletComponent } from "./components/wallet/wallet.component";
import { TxSharerComponent } from "./components/txSharer/txSharer.component";
import { TxEdenComponent } from "./components/txEden/txEden.component";
import { WalletNewComponent } from "./components/walletNew/walletNew.component";

// services
import { Web3Service } from "./services/web3.service";
import { GethService } from "./services/geth.service";
import { SqliteService } from "./services/sqlite.service";
import { BipService } from "./services/bip.service";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SiderbarComponent,
    WalletComponent,
    TxSharerComponent,
    TxEdenComponent,
    WalletNewComponent,
    WebviewDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ElModule.forRoot(),
    FormsModule,
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
    Web3Service,
    GethService,
    BipService,
    SqliteService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
