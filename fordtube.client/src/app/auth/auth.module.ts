import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { UserAdminGuard } from './guards/user.admin.guard';
import { UserDealerAdminGuard } from './guards/user.dealer.admin.guard';
import { UserDealerGuard } from './guards/user.dealer.guard';
import { UserEmployeeDealerAdminGuard } from './guards/user.employee.dealer.admin.guard';
import { SigninOidcComponent } from './signin-oidc/signin-oidc.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    SigninOidcComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule
  ],
  providers: [
    UserAdminGuard,
    UserDealerAdminGuard,
    UserDealerGuard,
    UserEmployeeDealerAdminGuard,
    AuthService
  ]
})
export class AuthModule { }
