import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: 'app-api',
    loadChildren: './app-api/app.api.module#AppAPIModule'
  },
  {
    path: 'escrow',
    loadChildren: './escrow/escrow.module#EscrowModule'
  },
  {
    path: '',
    loadChildren: './security/security.module#SecurityModule'
  },
  {
    path: 'login',
    loadChildren: './security/security.module#SecurityModule'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomeModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // preload all modules; optionally we could
    // implement a custom preloading strategy for just some
    // of the modules (PRs welcome 😉)
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
