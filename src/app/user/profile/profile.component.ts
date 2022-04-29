import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {AuthService} from "../../auth/auth.service";
import {Subscription} from "rxjs";
import {ImageOrderFilter, OrderOptions} from "../../image/model/image.model";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username!: string;
  orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.NEWEST,
    isTimeOrderAllowed: true,
    isTippedOrderAllowed: true,
    isTopFilterAllowed: false
  };

  private isReady = false;
  private usernameSub!: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public authService: AuthService) {
  }

  ngOnInit(): void {
    this.usernameSub = this.route.paramMap
      .pipe(
        map(paramMap => paramMap.get('username')),
      ).subscribe({
        next: username => {
          if (!username) {
            this.router.navigate(['/']);
            return;
          }
          this.username = username;
          this.isReady = true;
        }
      });
  }

}
