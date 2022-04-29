import { Component, OnInit } from '@angular/core';
import {ImageOrderFilter, OrderOptions} from "../image/model/image.model";

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent implements OnInit {
  orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.TOP_VOTED_LAST_WEEK,
    isTimeOrderAllowed: false,
    isTippedOrderAllowed: true,
    isTopFilterAllowed: true
  };

  constructor() { }

  ngOnInit(): void {
  }

}
