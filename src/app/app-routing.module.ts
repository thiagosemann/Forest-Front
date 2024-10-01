import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/service/authGuard';


import { LoginComponent } from './login/login.component';
import { LandingComponent } from './landing/landing.component';
import { ContentComponent } from './content/content.component';
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


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent},
  { path: 'landing', component: LandingComponent, canActivate: [AuthGuardService] },
  { path: 'content/:id', component: ContentComponent, canActivate: [AuthGuardService] },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'users', component: UsersControlComponent, canActivate: [AuthGuardService] },
  { path: 'predios', component: BuildingsControlComponent, canActivate: [AuthGuardService] },
  { path: 'vagas', component: VagasComponent, canActivate: [AuthGuardService] },
  { path: 'gastosComuns', component: BuildingsReviewComponent, canActivate: [AuthGuardService] },
  { path: 'gastosIndividuais', component: GastosIndividuaisComponent, canActivate: [AuthGuardService] },
  { path: 'rateio', component: RateioComponent, canActivate: [AuthGuardService] },
  { path: 'provisao', component: ProvisoesComponent, canActivate: [AuthGuardService] },
  { path: 'fundos', component: FundosComponent, canActivate: [AuthGuardService] },


  
  
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
