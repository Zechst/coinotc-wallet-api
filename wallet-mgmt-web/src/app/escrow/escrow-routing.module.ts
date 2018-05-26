import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "../shared/security/auth.guard";
import { EscrowComponent } from './escrow.component';
import { EscrowDetailsComponent } from './escrow.details.component';


const routes: Routes = [
    {
        path: '',
        component: EscrowComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'details/:id',
        component: EscrowDetailsComponent,
        canActivate: [AuthGuard]
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EscrowRoutingModule {}