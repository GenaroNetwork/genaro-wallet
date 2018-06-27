import { WalletComponent } from './components/wallet/wallet.component';
import { TxSharerComponent } from "./components/txSharer/txSharer.component";
import { TxEdenComponent } from "./components/txEden/txEden.component";

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
    path: 'wallet',
    component: WalletComponent,
}, {
    path: 'tx-eden',
    component: TxEdenComponent,
}, {
    path: 'tx-sharer',
    component: TxSharerComponent,
}, {
    path: "",
    pathMatch: "full",
    redirectTo: "/wallet",
}];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
