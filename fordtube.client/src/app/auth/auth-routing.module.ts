import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SigninOidcComponent } from "./signin-oidc/signin-oidc.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signin-oidc', component: SigninOidcComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
