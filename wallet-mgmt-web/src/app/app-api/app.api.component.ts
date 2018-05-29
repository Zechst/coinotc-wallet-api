import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppAPIService } from '../shared/services/api.app.service';
import { Observable } from 'rxjs/Observable';
import { App } from '../shared/models/App';
import { environment } from '../../environments/environment';
import { AppAPICriteria } from '../shared/models/AppAPICriteria';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-api',
  templateUrl: './app.api.component.html',
  styleUrls: ['./app.api.component.css']
})

export class AppAPIComponent implements OnInit {
  displayedColumns = ['appname', 'token', 'createdAt'];
  
  appApisObservable$: Observable<App[]>;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = +environment.itemPerPage;
  indexOnPage: number = 0;
  model = new AppAPICriteria(this.currentPage, this.itemsPerPage);
  result: App[] = [];
  dataSource;
  text1: string;
  isCopied1: boolean;

  constructor(private appApiService: AppAPIService, public snackBar: MatSnackBar) { 
    this.appApisObservable$ = this.appApiService.searchApps(this.model);
  }

  ngOnInit() {
    this.appApisObservable$.subscribe((x) => {
      this.totalItems = x.length;
      this.result = x.slice(this.indexOnPage, this.itemsPerPage);
      this.dataSource = this.result;
    });
  }

  copyLink(text:string) {
      var event = (e: ClipboardEvent) => {
          e.clipboardData.setData('text/plain', text);
          e.preventDefault();
          document.removeEventListener('copy', event);
      }
      document.addEventListener('copy', event);
      document.execCommand('copy');
      this.openSnackBar('API Key copied', '');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}