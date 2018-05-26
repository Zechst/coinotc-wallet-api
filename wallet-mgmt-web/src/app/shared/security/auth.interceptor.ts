import { Injectable } from '@angular/core';

import{ 
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import {AngularFireAuth } from "angularfire2/auth";
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    IdToken: string;

    constructor(private afAuth: AngularFireAuth, protected localStorage: LocalStorage){
        
    }

    intercept(request: HttpRequest<any>, next: HttpHandler){
        return Observable.fromPromise(this.handleAccess(request, next));
    }

    private async handleAccess(request: HttpRequest<any>, next: HttpHandler):
        Promise<HttpEvent<any>> {
        let changedRequest = request;
        let idToken = null;
        await this.afAuth.auth.currentUser.getIdToken().then(_idToken => {
                console.log("AuthInterceptor >>>>> " + _idToken);
                idToken = _idToken;
            }
        );

        // HttpHeader object immutable - copy values
        const headerSettings: {[name: string]: string | string[]; } = {};

        for (const key of request.headers.keys()) {
            headerSettings[key] = request.headers.getAll(key);
        }
        console.log(">> " + idToken);
        console.log(">> " + headerSettings["coinotc-apikey"]);
        if(typeof (headerSettings["coinotc-apikey"]) === 'undefined'){
            if (idToken) {
                headerSettings['Authorization'] = 'Bearer ' + idToken;
            }
        }else{
            headerSettings['Authorization'] = 'Bearer ' + headerSettings["coinotc-apikey"];
        }
       
        headerSettings['Content-Type'] = 'application/json';
        const newHeader = new HttpHeaders(headerSettings);
        console.log(newHeader);
        changedRequest = request.clone({
            headers: newHeader});
        return next.handle(changedRequest).toPromise();
    }
}