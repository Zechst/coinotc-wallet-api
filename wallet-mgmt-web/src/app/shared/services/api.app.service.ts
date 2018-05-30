import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable} from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { App } from '../../shared/models/App';
import {AngularFireAuth } from "angularfire2/auth";
import { LocalStorage } from '@ngx-pwa/local-storage';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class AppAPIService { 
  private ApiAppRootApiUrl  = `${environment.ApiUrl}/api/wallet-auth`;
  constructor(private httpClient: HttpClient, 
    private afAuth: AngularFireAuth, 
    protected localStorage: LocalStorage,
    public snackBar: MatSnackBar) {
  }

  public addApp (app: App): Observable<App> {
    return this.httpClient.post<App>(this.ApiAppRootApiUrl, 
      app)
      .pipe(
        catchError(this.handleError('addApp', app))
      );
  }

  public updateApp (app: App): Observable<App> {
    return this.httpClient.put<App>(this.ApiAppRootApiUrl, 
      app)
      .pipe(
        catchError(this.handleError('updateApp', app))
      );
  }

  public deleteApp (app: App): Observable<App> {
    const deleteUrl = `${this.ApiAppRootApiUrl}/${app._id}`; // DELETE api/books/1
    console.log(deleteUrl);
    return this.httpClient.delete<App>(deleteUrl)
      .pipe(
        catchError(this.handleError('deleteApp', app))
      );
  }

  public searchApps(model) : Observable<App[]> {
    var getURL = `${this.ApiAppRootApiUrl}/apps?currentPerPage=${model.currentPerPage}&itemsPerPage=${model.itemsPerPage}`;
    return this.httpClient.get<App[]>(getURL)
      .pipe(catchError(this.handleError<App[]>('searchApps')));
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