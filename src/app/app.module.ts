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
import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { ContentComponent } from './content/content.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { UsersControlComponent } from './users-control/users-control.component';
import { BuildingsControlComponent } from './buildings-control/buildings-control.component';
import { BuildingsReviewComponent } from './Gastos-Comun/buildings-review/buildings-review.component';
import { GastosIndividuaisComponent } from './gastos-individuais/gastos-individuais.component';
import { RateioComponent } from './rateio/rateio.component';
import { VagasComponent } from './vagas/vagas.component';
import { FundosComponent } from './fundos/fundos.component';
import { ProvisoesComponent } from './provisoes/provisoes.component';
import { ApartamentosControlComponent } from './apartamentos-control/apartamentos-control.component';
import { CameraAppComponent } from './camera-app/camera-app.component';

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
    CameraAppComponent
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
