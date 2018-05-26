import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared';
import {AuthGuard} from "../shared/security/auth.guard";

const homeRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  }
]);

@NgModule({
  imports: [
    CommonModule,
    homeRouting,
    SharedModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }