import {Component, OnInit} from '@angular/core';
import {ImageOrderFilter, ImagePublishFilter, OrderOptions} from "../../image/model/image.model";

@Component({
  selector: 'app-image-pending',
  templateUrl: './image-pending.component.html',
  styleUrls: ['./image-pending.component.css']
})
export class ImagePendingComponent implements OnInit {
  orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.NEWEST,
    isTimeOrderAllowed: true,
    isTippedOrderAllowed: false,
    isTopFilterAllowed: false
  }

  publishType = ImagePublishFilter.PENDING;

  constructor() {
  }

  ngOnInit(): void {
  }

}
