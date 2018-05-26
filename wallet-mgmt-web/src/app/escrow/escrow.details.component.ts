import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppAPIService } from '../shared/services/api.app.service';
import { Observable } from 'rxjs/Observable';
import { EscrowService } from '../shared/services/escrow.service';
import { Escrow } from '../shared/models/Escrow';
import { environment } from '../../environments/environment';
import { EscrowCriteria } from '../shared/models/EscrowCriteria';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'escrow-details',
  templateUrl: './escrow.details.component.html',
  styleUrls: ['./escrow.details.component.css']
})

export class EscrowDetailsComponent implements OnInit {
  displayedColumns = ['appname', 'token', 'createdAt'];
  
  escrowDetailsObservable$: Observable<Escrow[]>;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = +environment.itemPerPage;
  indexOnPage: number = 0;
  model = new EscrowCriteria(this.currentPage, this.itemsPerPage);
  result: Escrow[] = [];
  dataSource;
  text1: string;
  isCopied1: boolean;

  constructor(private escrowService: EscrowService, 
    public snackBar: MatSnackBar, 
    private route: ActivatedRoute,
    private location: Location) 
  { 
    const escrowWalletid = +this.route.snapshot.paramMap.get('id');
    console.log("Incoming params > " + escrowWalletid);
    this.model.id = new String(escrowWalletid);
    console.log("Incoming params > " + this.model.id);
    this.escrowDetailsObservable$ = this.escrowService.searchEscrow(this.model);
  }

  ngOnInit() {
    this.escrowDetailsObservable$.subscribe((x) => {
      this.totalItems = x.length;
      this.result = x.slice(this.indexOnPage, this.itemsPerPage);
      this.dataSource = this.result;
    });
  }
}