import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
//import { HomeModule } from './home/home.module';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { firebaseConfig } from "../environments/firebase.config";
import { environment } from "../environments/environment";

import { AngularFireModule } from "angularfire2";
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthServiceFirebase } from './shared/security/auth.service';
import { AuthGuard } from './shared/security/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './shared/security/auth.interceptor';

import { SafeUrlPipe } from './shared/security/safe-url.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';

import {
  FooterComponent,
  HeaderComponent,
  AppAPIService,
  EscrowService,
  SharedModule
} from './shared';

/*
import {
  SecurityModule
} from './security';

import {
  AppAPIModule
} from './app-api';


import {
  EscrowModule
} from './escrow';
*/
import { AppRoutingModule } from './app.routing.module';
//const rootRouting: ModuleWithProviders = RouterModule.forRoot([]);

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    SafeUrlPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    Ng4LoadingSpinnerModule.forRoot(),
    environment.production ? ServiceWorkerModule.register('ngsw-worker.js') : []
  ],
  providers: [
              { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
              AuthServiceFirebase,
              AuthGuard,
              AppAPIService,
              EscrowService
            ],          
  bootstrap: [AppComponent]
})
export class AppModule { }
