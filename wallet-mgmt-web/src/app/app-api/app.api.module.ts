import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppAPIComponent } from './app.api.component';
import {AuthGuard} from "../shared/security/auth.guard";

const appApiRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'app-api',
    component: AppAPIComponent,
    canActivate: [AuthGuard]
  }
]);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    appApiRouting,
    BrowserAnimationsModule,
  ],
  declarations: [AppAPIComponent]
})
export class AppAPIModule { }