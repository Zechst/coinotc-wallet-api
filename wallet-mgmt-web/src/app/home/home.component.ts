import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { chart } from 'highcharts';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    title = 'No of Wallets';

    @ViewChild('chartTarget') chartTarget: ElementRef;
    @ViewChild('chartTarget2') chartTarget2: ElementRef;

    chart: Highcharts.ChartObject;
    chart2: Highcharts.ChartObject;
    constructor() { }

    ngOnInit() {
    
    }

    ngAfterViewInit() {
        const options: Highcharts.Options = {
          chart: {
            type: 'bar'
          },
          title: {
            text: 'Total no. of Crypto Wallets (Daily)'
          },
          xAxis: {
            categories: ['BTC', 'ETH', 'XLM', 'ADA', 'XRP', 'XMR', 'ZIL']
          },
          yAxis: {
            title: {
              text: 'No of Wallets'
            }
          },
          series: [{
            name: '2018',
            data: [1, 0, 4, 6, 10, 6, 7]
          }, {
            name: '2019',
            data: [5, 7, 3, 4, 7, 8, 4]
          }]
        };
      
        this.chart = chart(this.chartTarget.nativeElement, options);
        const options2: Highcharts.Options = {
          chart: {
            type: 'bar'
          },
          title: {
            text: 'Total no. of Crypto Wallets (Monthly)'
          },
          xAxis: {
            categories: ['BTC', 'ETH', 'XLM', 'ADA', 'XRP', 'XMR', 'ZIL']
          },
          yAxis: {
            title: {
              text: 'No of Wallets'
            }
          },
          series: [{
            name: '2018',
            data: [1, 0, 4, 6, 10, 6, 7]
          }, {
            name: '2019',
            data: [5, 7, 3, 4, 7, 8, 4]
          }]
        };
      
        this.chart2 = chart(this.chartTarget2.nativeElement, options2);
    }

}