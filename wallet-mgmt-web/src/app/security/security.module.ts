import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import {AuthGuard} from "../shared/security/auth.guard";

const securityRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    securityRouting,
    BrowserAnimationsModule,
  ],
  declarations: [LoginComponent]
})
export class SecurityModule { }