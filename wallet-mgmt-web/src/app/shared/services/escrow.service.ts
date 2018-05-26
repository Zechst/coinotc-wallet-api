import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable} from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Escrow } from '../../shared/models/Escrow';
import { AngularFireAuth } from "angularfire2/auth";
import { LocalStorage } from '@ngx-pwa/local-storage';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class EscrowService { 
  private ApiAppRootApiUrl  = `${environment.ApiUrl}/api/wallets/escrow`;
  private idToken= null;
  constructor(private httpClient: HttpClient, 
    private afAuth: AngularFireAuth, 
    protected localStorage: LocalStorage,
    public snackBar: MatSnackBar) {
 
  }

  public addEscrow (escrow: Escrow): Observable<Escrow> {
    return this.httpClient.post<Escrow>(this.ApiAppRootApiUrl, 
        escrow,
      {headers: new HttpHeaders().set('coinotc-apikey', `0c09dfb49f9b996a0d2b537c55cfeaf4f83bdc4e2fef7145054ca378ca48220a`)})
      .pipe(
        catchError(this.handleError('addEscrow', escrow))
      );
  }

  public updateApp (escrow: Escrow): Observable<Escrow> {
    return this.httpClient.put<Escrow>(this.ApiAppRootApiUrl, 
        escrow,
      {headers: new HttpHeaders().set('coinotc-apikey', `0c09dfb49f9b996a0d2b537c55cfeaf4f83bdc4e2fef7145054ca378ca48220a`)})
      .pipe(
        catchError(this.handleError('updateApp', escrow))
      );
  }

  public deleteEscrow (escrow: Escrow): Observable<Escrow> {
    const deleteUrl = `${this.ApiAppRootApiUrl}/${escrow._id}`; // DELETE api/books/1
    console.log(deleteUrl);
    return this.httpClient.delete<Escrow>(deleteUrl,
      {headers: new HttpHeaders().set('coinotc-apikey', `0c09dfb49f9b996a0d2b537c55cfeaf4f83bdc4e2fef7145054ca378ca48220a`)})
      .pipe(
        catchError(this.handleError('deleteApp', escrow))
      );
  }

  public searchEscrow(model) : Observable<Escrow[]> {
    
    var getURL = `${this.ApiAppRootApiUrl}?keyword=${model.keyword}&searchType=${model.searchType}&sortBy=${model.sortBy}&currentPerPage=${model.currentPerPage}&itemsPerPage=${model.itemsPerPage}`;
    return this.httpClient.get<Escrow[]>(getURL, {headers: new HttpHeaders().set('coinotc-apikey', `0c09dfb49f9b996a0d2b537c55cfeaf4f83bdc4e2fef7145054ca378ca48220a`)})
      .pipe(catchError(this.handleError<Escrow[]>('searchEscrow')));
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