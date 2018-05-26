import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable} from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';
import { App } from '../../shared/models/App';
import {AngularFireAuth } from "angularfire2/auth";
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class BookServiceService {
  private ApiAppRootApiUrl  = `${environment.ApiUrl}/api/books`;
  
  constructor(private httpClient: HttpClient, 
    private toastyService: ToastyService, 
    private toastyConfig: ToastyConfig,
    private afAuth: AngularFireAuth, protected localStorage: LocalStorage) {

  }

  public addApp (app: App): Observable<App> {
    let idToken= null;
    this.localStorage.getItem<any>('firebaseIdToken').subscribe((token ) => {
        idToken = token;
    });
    return this.httpClient.post<App>(this.ApiAppRootApiUrl, 
      app,
      {headers: new HttpHeaders().set('Authorization', `Bearer ${idToken}`)})
      .pipe(
        catchError(this.handleError('addApp', app))
      );
  }

  public updateApp (app: App): Observable<App> {
    let idToken= null;
    this.localStorage.getItem<any>('firebaseIdToken').subscribe((token ) => {
        idToken = token;
    });
    return this.httpClient.put<App>(this.ApiAppRootApiUrl, 
      app,
      {headers: new HttpHeaders().set('Authorization', `Bearer ${idToken}`)})
      .pipe(
        catchError(this.handleError('updateApp', app))
      );
  }

  public deleteApp (app: App): Observable<App> {
    let idToken= null;
    this.localStorage.getItem<any>('firebaseIdToken').subscribe((token ) => {
        idToken = token;
    });
    const deleteUrl = `${this.ApiAppRootApiUrl}/${app.id}`; // DELETE api/books/1
    console.log(deleteUrl);
    return this.httpClient.delete<App>(deleteUrl,
      {headers: new HttpHeaders().set('Authorization', `Bearer ${idToken}`)})
      .pipe(
        catchError(this.handleError('deleteApp', app))
      );
  }

  public searchApps(model) : Observable<App[]> {
    
    let idToken= null;
    this.localStorage.getItem<any>('firebaseIdToken').subscribe((token ) => {
        idToken = token;
    });
    var getURL = `${this.ApiAppRootApiUrl}?keyword=${model.keyword}&searchType=${model.searchType}&sortBy=${model.sortBy}&currentPerPage=${model.currentPerPage}&itemsPerPage=${model.itemsPerPage}`;
    return this.httpClient.get<App[]>(getURL, 
      {headers: new HttpHeaders().set('Authorization', `Bearer ${idToken}`)}
    )
      .pipe(catchError(this.handleError<App[]>('searchApps')));
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.addToastMessage("Error", JSON.stringify(error.error));
      return Observable.throw(error  || 'backend server error');
    };
  }

  addToastMessage(title, msg) {
    let toastOptions: ToastOptions = {
        title: title,
        msg: msg,
        showClose: true,
        timeout: 3500,
        onAdd: (toast: ToastData) => {
            console.log('Toast ' + toast.id + ' has been added!');
        },
        onRemove: function(toast: ToastData) {
            console.log('Toast ' + toast.id + ' has been removed!');
        }
    };
    this.toastyService.error(toastOptions);
  }


}