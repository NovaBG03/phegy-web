import {Component, OnDestroy, OnInit} from '@angular/core';
import {PointsService} from "../points.service";
import {Subscription} from "rxjs";
import {PointsBag} from "../model/points.model";

@Component({
  selector: 'app-points-bag',
  templateUrl: './points-bag.component.html',
  styleUrls: ['./points-bag.component.css']
})
export class PointsBagComponent implements OnInit, OnDestroy {
  pointsBag: PointsBag | null = null;
  isTooltipOpen = false;
  private pointsBagSub!: Subscription;

  constructor(private pointsService: PointsService) {
  }

  ngOnInit(): void {
    this.pointsBagSub = this.pointsService.listenPointsBag()
        .subscribe(pointsBag => this.pointsBag = pointsBag);
  }

  ngOnDestroy(): void {
    this.pointsBagSub?.unsubscribe();
  }
}
