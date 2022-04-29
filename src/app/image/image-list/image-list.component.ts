import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ImageService} from "../image.service";
import {Image, ImageFilter, ImageOrderFilter, ImagePublishFilter, OrderOptions} from "../model/image.model";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {map, switchMap, tap} from "rxjs/operators";
import {environment} from "../../../environments/environment";
import {Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {NgxMasonryOptions} from "ngx-masonry/lib/ngx-masonry-options";

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit, OnDestroy {
  @Input('publisher') set setPublisher(publisher: string) {
    this.publisher = publisher;
    this.loadImages();
  }

  @Input('showFilterTypeControls') set setShowFilterTypeControls(showFilterTypeControls: boolean) {
    this.showFilterTypeControls = showFilterTypeControls;
    this.loadImages();
  }

  @Input() orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.NEWEST,
    isTimeOrderAllowed: false,
    isTippedOrderAllowed: false,
    isTopFilterAllowed: false
  }

  @Input() publishType!: ImagePublishFilter;
  @Input() isModeratorMode: boolean = false;

  publisher!: string;
  images: Image[] = [];
  isLoading = true;
  imagesTotalCount = 0;
  currentPage = 1;
  size = environment.defaultPageSize;

  showFilterTypeControls: boolean = false;

  isApproved = true;
  isPending = false;
  approvedCheckboxValue = false;
  pendingCheckboxValue = false;

  masonryOptions: NgxMasonryOptions = {
    gutter: 10,
    animations: {},
    fitWidth: true
  };

  private loadImagesSub!: Subscription;

  constructor(public authService: AuthService,
              private imageService: ImageService,
              private route: ActivatedRoute,
              private router: Router,
              private elementRef: ElementRef<HTMLElement>) {
  }

  ngOnInit(): void {
    this.loadImages();
    window.scroll(0, 0);
  }

  loadImages(): void {
    this.isLoading = true;
    this.loadImagesSub?.unsubscribe();
    this.loadImagesSub = this.route.queryParams
      .pipe(
        tap(() => {
          this.isLoading = true;
          const offsetTop = this.elementRef.nativeElement.offsetTop;
          if (offsetTop) {
            window.scroll(0, offsetTop - 100);
          }
        }),
        tap(params => {
          if (!params.approved) {
            this.isApproved = true;
          } else if (ImageListComponent.isValidBoolean(params.approved)) {
            this.isApproved = JSON.parse(params.approved);
          } else {
            this.navigateToDefaultPage();
          }

          if (!params.pending) {
            this.isPending = true;
          } else if (ImageListComponent.isValidBoolean(params.pending)) {
            this.isPending = JSON.parse(params.pending);
          } else {
            this.navigateToDefaultPage();
          }

          const orderFilter: ImageOrderFilter = ImageOrderFilter[params.order?.toUpperCase() as keyof typeof ImageOrderFilter]
          if (orderFilter) {
            this.orderOptions.selectedFilter = orderFilter;
          } else if (this.orderOptions.isTimeOrderAllowed) {
            this.orderOptions.selectedFilter = ImageOrderFilter.NEWEST;
          } else if (this.orderOptions.isTopFilterAllowed) {
            this.orderOptions.selectedFilter = ImageOrderFilter.TOP_VOTED_LAST_3_DAYS;
          } else if (this.orderOptions.isTippedOrderAllowed) {
            this.orderOptions.selectedFilter = ImageOrderFilter.LATEST_VOTED;
          }

          if (!params.size) {
            this.size = environment.defaultPageSize;
          } else if (+params.size >= 1) {
            this.size = +params.size;
          } else {
            this.navigateToDefaultPage();
          }

          if (!params.page) {
            this.currentPage = 1;
          } else if (+params.page >= 1) {
            this.currentPage = +params.page;
          } else {
            this.navigateToDefaultPage();
          }
        }),
        tap(() => {
          const different = this.isApproved != this.isPending;
          this.approvedCheckboxValue = different && this.isApproved;
          this.pendingCheckboxValue = different && this.isPending;
        }),
        map(() => {
          let imageFilter: ImageFilter = {};
          if (this.publishType) {
            imageFilter.publishFilter = this.publishType;
          } else if (this.showFilterTypeControls) {
            imageFilter.publishFilter = ImagePublishFilter.APPROVED;
            if (this.isApproved && this.isPending) {
              imageFilter.publishFilter = ImagePublishFilter.ALL;
            } else if (this.isPending) {
              imageFilter.publishFilter = ImagePublishFilter.PENDING;
            }
            imageFilter.publisher = this.authService.user.getValue()?.username;
          }

          if (this.publisher) {
            imageFilter.publisher = this.publisher;
          }

          imageFilter.orderFilter = this.orderOptions.selectedFilter;

          return imageFilter;
        }),
        switchMap(options => this.imageService.getImages(this.currentPage - 1, this.size, options))
      ).subscribe({
        next: response => {
          this.imagesTotalCount = response.totalCount;
          this.images = response.images;
          this.isLoading = false;
        },
        error: () => {
          // todo fix not working
          this.navigateToDefaultPage()
        }
      });
  }

  getArray(length: number): any[] {
    return Array(length);
  }

  pendingOnlyToggle($event: Event): void {
    $event.preventDefault();

    const persistedQueryParams: Params = {
      approved: this.isPending && !this.isApproved,
      pending: true,
      page: 1
    };

    if (this.orderOptions.selectedFilter != ImageOrderFilter.NEWEST
      && this.orderOptions.selectedFilter != ImageOrderFilter.OLDEST) {
      persistedQueryParams.order = ImageOrderFilter.NEWEST;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: persistedQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  approvedOnlyToggle($event: Event): void {
    $event.preventDefault();

    const persistedQueryParams: Params = {
      approved: true,
      pending: this.isApproved && !this.isPending,
      page: 1
    };

    if (persistedQueryParams.pending
      && this.orderOptions.selectedFilter != ImageOrderFilter.NEWEST
      && this.orderOptions.selectedFilter != ImageOrderFilter.OLDEST) {
      persistedQueryParams.order = ImageOrderFilter.NEWEST;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: persistedQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  moveToPage(page: number | string): void {
    const pageNumber = +page;
    if (!pageNumber) {
      return;
    }

    const updatedQueryParams: Params = {
      approved: this.isApproved,
      pending: this.isPending,
      order: this.orderOptions.selectedFilter,
      size: this.size,
      page: page
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: updatedQueryParams
    });
  }

  private navigateToDefaultPage() {
    const persistedQueryParams: Params = {
      size: this.size,
      page: this.currentPage,
      approved: this.isApproved,
      pending: this.isPending
    };

    this.router.navigate([], {
      // relativeTo: this.route,
      queryParams: persistedQueryParams
    });
  }


  private static isValidBoolean(str: String) {
    return str.toLowerCase() === 'true' || str.toLowerCase() === 'false';
  }

  ngOnDestroy(): void {
    this.loadImagesSub?.unsubscribe();
  }
}
