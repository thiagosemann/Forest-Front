import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskModule } from 'ngx-mask';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgChartsModule } from 'ng2-charts';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { OrdenarPorPrecoPipe } from '../app/shared/pipes/ordenar-por-preco.pipe'; // ajuste o caminho conforme necessário

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './Compartilhados/landing/landing.component';
import { ForgotPasswordComponent } from './Compartilhados/forgot-password/forgot-password.component';

import { UsersControlComponent } from './Gerencia-Predios/users-control/users-control.component';
import { BuildingsControlComponent } from './Gerencia-Predios/buildings-control/buildings-control.component';
import { BuildingsReviewComponent } from './Gerencia-Predios/Gastos-Comun/buildings-review/buildings-review.component';
import { GastosIndividuaisComponent } from './Gerencia-Predios/gastos-individuais/gastos-individuais.component';
import { RateioComponent } from './Gerencia-Predios/rateio/rateio.component';
import { VagasComponent } from './Gerencia-Predios/vagas/vagas.component';
import { FundosComponent } from './Gerencia-Predios/fundos/fundos.component';
import { ApartamentosControlComponent } from './Gerencia-Predios/apartamentos-control/apartamentos-control.component';

import { ExpenseTypeControllComponent } from './Gerencia-Predios/expense-type-controll/expense-type-controll.component';
import { PrestacaoContasComponent } from './Gerencia-Predios/prestacao_de_contas/prestacao-contas/prestacao-contas.component';
import { NotaFiscalGastosComunsComponent } from './Gerencia-Predios/prestacao_de_contas/nota-fiscal-gastos-comuns/nota-fiscal-gastos-comuns.component';
import { PdfPrestacaoComponent } from './Gerencia-Predios/prestacao_de_contas/pdf-prestacao/pdf-prestacao.component';
import { CobrancaPrestacaoComponent } from './Gerencia-Predios/prestacao_de_contas/cobranca-prestacao/cobranca-prestacao.component';
import { GeradorRateioComponent } from './Gerencia-Predios/gerador-rateio/gerador-rateio.component';
import { SaldoInvestimentoPredioComponent } from './Gerencia-Predios/saldo-investimento-predio/saldo-investimento-predio.component';
import { CalendarioAirbnbComponent } from './AIRBNB/calendario-airbnb/calendario-airbnb.component';
import { CameraAppComponent } from './AIRBNB/camera-app/camera-app.component';
import { ContentComponent } from './Compartilhados/content/content.component';
import { LoginComponent } from './Compartilhados/login/login.component';
import { NavBarComponent } from './Compartilhados/nav-bar/nav-bar.component';
import { ProfileComponent } from './Compartilhados/profile/profile.component';
import { RegisterComponent } from './Compartilhados/register/register.component';
import { ProvisoesComponent } from './Gerencia-Predios/provisoes/provisoes.component';
import { EnvioRateioBoletosComponent } from './Gerencia-Predios/envio-rateio-boletos/envio-rateio-boletos.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingComponent,
    ContentComponent,
    NavBarComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    RegisterComponent,
    OrdenarPorPrecoPipe,
    UsersControlComponent,
    BuildingsControlComponent,
    BuildingsReviewComponent,
    GastosIndividuaisComponent,
    RateioComponent,
    VagasComponent,
    FundosComponent,
    ProvisoesComponent,
    ApartamentosControlComponent,
    CalendarioAirbnbComponent,
    CameraAppComponent,
    ExpenseTypeControllComponent,
    SaldoInvestimentoPredioComponent,
    PrestacaoContasComponent,
    NotaFiscalGastosComunsComponent,
    PdfPrestacaoComponent,
    CobrancaPrestacaoComponent,
    GeradorRateioComponent,
    EnvioRateioBoletosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgxMaskModule.forRoot(),
    NgChartsModule,
    BsDatepickerModule,
    ZXingScannerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
