import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { EscrowComponent } from './escrow.component';
import { EscrowDetailsComponent } from './escrow.details.component';
import { AuthGuard } from "../shared/security/auth.guard";
import { EscrowRoutingModule } from './escrow-routing.module';

@NgModule({
  imports: [
    SharedModule,
    EscrowRoutingModule,
  ],
  declarations: [EscrowComponent, EscrowDetailsComponent]
})
export class EscrowModule { }