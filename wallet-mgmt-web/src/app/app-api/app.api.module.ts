import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { AppAPIComponent } from './app.api.component';

import { AppAPIRoutingModule } from './app.api-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AppAPIRoutingModule
  ],
  declarations: [AppAPIComponent]
})
export class AppAPIModule { }