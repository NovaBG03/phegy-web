import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {ImageOrderFilter, OrderOptions} from "../image/model/image.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.NEWEST,
    isTimeOrderAllowed: true,
    isTippedOrderAllowed: false,
    isTopFilterAllowed: false
  };

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

}
