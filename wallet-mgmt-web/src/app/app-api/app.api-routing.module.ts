import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "../shared/security/auth.guard";


import { AppAPIComponent } from './app.api.component';
const routes: Routes = [
  {
    path: '',
    component: AppAPIComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppAPIRoutingModule {}