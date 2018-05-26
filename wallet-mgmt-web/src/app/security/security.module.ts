import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { LoginComponent } from './login/login.component';
import { SecurityRoutingModule } from './security-routing.module';

@NgModule({
  imports: [
    SharedModule,
    SecurityRoutingModule
  ],
  declarations: [LoginComponent]
})
export class SecurityModule { }