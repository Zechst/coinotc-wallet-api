import { Injectable } from '@angular/core';
import {Observable, Subject, BehaviorSubject} from "rxjs/Rx";
import { catchError } from 'rxjs/operators';
import {AngularFireAuth } from "angularfire2/auth";

import {AuthInfo} from "./auth-info";
import {Router} from "@angular/router";
import { LocalStorage } from '@ngx-pwa/local-storage';

import * as firebase from 'firebase/app';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class AuthServiceFirebase {

    static UNKNOWN_USER = new AuthInfo(null, null);

    authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(AuthServiceFirebase.UNKNOWN_USER);
    authState: any = null;
    constructor(private afAuth: AngularFireAuth, private router:Router,
        public snackBar: MatSnackBar,
        private localStorage: LocalStorage) {
            this.afAuth.authState.subscribe((auth) => {
                this.authState = auth
            });
    }

    login(email, password):Observable<AuthInfo> {
        return this.fromFirebaseAuthPromise(this.afAuth.auth.signInWithEmailAndPassword(email, password))
        .pipe(
            catchError(this.handleError('login', AuthInfo))
        );
    }

    

    googleLogin() {
        return new Promise<any>((resolve, reject) => {
            let provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            this.afAuth.auth
            .signInWithPopup(provider)
            .then(res => {
                this.updateUserData()
                resolve(res);
            }, err => {
              console.log(err);
              reject(err);
            })
          })

        //var provider = new firebase.auth.GoogleAuthProvider();
        //return this.socialSignIn(provider);
    }

    private updateUserData(){
        console.log("call backend end point to update userdata....");
    }


    signUp(email, password) {
        return this.fromFirebaseAuthPromise(this.afAuth.auth.createUserWithEmailAndPassword(email, password));
    }

    setTokenIdToLocalstorage(){
        this.afAuth.auth.currentUser.getIdToken().then(idToken => {
            this.localStorage.setItem('firebaseIdToken', idToken).subscribe(() => {});
            //this._storageService.set('firebaseIdToken', idToken);
        });
    }

    fromFirebaseAuthPromise(promise):Observable<any> {
        const subject = new Subject<any>();
        promise
            .then(res => {
                    const authInfo = new AuthInfo(
                            this.afAuth.auth.currentUser.uid, 
                            this.afAuth.auth.currentUser.email);
                    this.authInfo$.next(authInfo);
                    subject.next(res);
                    subject.complete();
                   
                },
                err => {
                    this.authInfo$.error(err);
                    console.log("err1 " + err);
                    subject.error(err);
                    subject.complete();
                });
        return subject.asObservable();
    }


    logout() {
        this.localStorage.removeItem('firebaseIdToken').subscribe(() => {});
        this.afAuth.auth.signOut();
        this.authInfo$.next(AuthServiceFirebase.UNKNOWN_USER);
        this.router.navigate(['']);

    }

    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
          this.openSnackBar(JSON.stringify(error), '');
          return Observable.throw(error  || 'backend server error');
        };
      }
    
      openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
          duration: 2000,
        });
      }  

}