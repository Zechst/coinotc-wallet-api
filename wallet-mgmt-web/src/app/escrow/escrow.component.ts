import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EscrowService } from '../shared/services/escrow.service';
import { Observable } from 'rxjs/Observable';
import { Escrow } from '../shared/models/Escrow';
import { environment } from '../../environments/environment';
import { EscrowCriteria } from '../shared/models/EscrowCriteria';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'escrow',
  templateUrl: './escrow.component.html',
  styleUrls: ['./escrow.component.css']
})

export class EscrowComponent implements OnInit {
  displayedColumns = ['cryptoType', 'escrowWalletAddress', 'feeRate', 'createdAt'];
  
  escrowObservable$: Observable<Escrow[]>;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = +environment.itemPerPage;
  indexOnPage: number = 0;
  model = new EscrowCriteria(this.currentPage, this.itemsPerPage);
  result: Escrow[] = [];
  dataSource;
  text1: string;
  isCopied1: boolean;

  constructor(private escrowService: EscrowService, public snackBar: MatSnackBar) { 
    this.escrowObservable$ = this.escrowService.searchEscrow(this.model);
  }

  ngOnInit() {
    this.escrowObservable$.subscribe((x) => {
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