import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/service/authGuard';


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
import { SaldoInvestimentoPredioComponent } from './Gerencia-Predios/saldo-investimento-predio/saldo-investimento-predio.component';
import { PrestacaoContasComponent } from './Gerencia-Predios/prestacao_de_contas/prestacao-contas/prestacao-contas.component';
import { GeradorRateioComponent } from './Gerencia-Predios/gerador-rateio/gerador-rateio.component';
import { CalendarioAirbnbComponent } from './AIRBNB/calendario-airbnb/calendario-airbnb.component';
import { CameraAppComponent } from './AIRBNB/camera-app/camera-app.component';
import { ContentComponent } from './Compartilhados/content/content.component';
import { LoginComponent } from './Compartilhados/login/login.component';
import { RegisterComponent } from './Compartilhados/register/register.component';
import { ProfileComponent } from './Compartilhados/profile/profile.component';
import { ProvisoesComponent } from './Gerencia-Predios/provisoes/provisoes.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cameraApp/:id', component: CameraAppComponent },
  { path: 'reservasAirbnb/:id', component: CameraAppComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent},
  { path: 'landing', component: LandingComponent, canActivate: [AuthGuardService] },
  { path: 'content/:id', component: ContentComponent, canActivate: [AuthGuardService] },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'users', component: UsersControlComponent, canActivate: [AuthGuardService] },
  { path: 'predios', component: BuildingsControlComponent, canActivate: [AuthGuardService] },
  { path: 'vagas', component: VagasComponent, canActivate: [AuthGuardService] },
  { path: 'expenseType', component: ExpenseTypeControllComponent, canActivate: [AuthGuardService] },
  { path: 'apartamentos', component: ApartamentosControlComponent, canActivate: [AuthGuardService] },
  { path: 'gastosComuns', component: BuildingsReviewComponent, canActivate: [AuthGuardService] },
  { path: 'gastosIndividuais', component: GastosIndividuaisComponent, canActivate: [AuthGuardService] },
  { path: 'rateio', component: RateioComponent, canActivate: [AuthGuardService] },
  { path: 'provisao', component: ProvisoesComponent, canActivate: [AuthGuardService] },
  { path: 'fundos', component: FundosComponent, canActivate: [AuthGuardService] },
  { path: 'saldos', component: SaldoInvestimentoPredioComponent, canActivate: [AuthGuardService] },
  { path: 'prestacao', component: PrestacaoContasComponent, canActivate: [AuthGuardService] },
  { path: 'geradorRateio', component: GeradorRateioComponent, canActivate: [AuthGuardService] },

  { path: 'Airbnb', component: CalendarioAirbnbComponent},

  { path: '', redirectTo: '/content', pathMatch: 'full' }, // redireciona para '/home' quando o caminho é vazio
  { path: '**', component: ContentComponent, canActivate: [AuthGuardService] }, // rota de fallback quando nenhuma outra corresponder

  // Outras rotas do seu aplicativo
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
