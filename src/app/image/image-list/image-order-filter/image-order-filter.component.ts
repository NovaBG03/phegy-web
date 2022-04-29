import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {ImageOrderFilter, OrderOptions} from "../../model/image.model";
import {ActivatedRoute, Params, Router} from "@angular/router";

@Component({
  selector: 'app-image-order-filter',
  templateUrl: './image-order-filter.component.html',
  styleUrls: ['./image-order-filter.component.css']
})
export class ImageOrderFilterComponent implements OnInit {
  @Input() orderOptions: OrderOptions = {
    selectedFilter: ImageOrderFilter.NEWEST,
    isTimeOrderAllowed: false,
    isTippedOrderAllowed: false,
    isTopFilterAllowed: false
  }

  isOpen = false;

  get orderFilterKeys(): ImageOrderFilter[] {
    const orderFilters: ImageOrderFilter[] = [];

    if (this.orderOptions.isTimeOrderAllowed) {
      orderFilters.push(ImageOrderFilter.NEWEST, ImageOrderFilter.OLDEST);
    }
    if (this.orderOptions.isTippedOrderAllowed) {
      orderFilters.push(ImageOrderFilter.LATEST_VOTED, ImageOrderFilter.MOST_VOTED);
    }
    if (this.orderOptions.isTopFilterAllowed) {
      orderFilters.push(ImageOrderFilter.TOP_VOTED_LAST_3_DAYS, ImageOrderFilter.TOP_VOTED_LAST_WEEK, ImageOrderFilter.TOP_VOTED_LAST_MONTH)
    }

    return orderFilters;
  }

  constructor(private route: ActivatedRoute,
              private router: Router,
              private eRef: ElementRef) {
  }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (target.classList.contains('filter-btn')) {
        return;
      }
      this.closeDropDown();
    }
  }

  closeDropDown() {
    this.isOpen = false;
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
  }

  getFilterDisplayName(imageOrderFilter: ImageOrderFilter): string {
    switch (imageOrderFilter) {
      case ImageOrderFilter.NEWEST:
        return 'Най-нови';
      case ImageOrderFilter.OLDEST:
        return 'Най-стари';
      case ImageOrderFilter.LATEST_VOTED:
        return 'Последно оценени';
      case ImageOrderFilter.MOST_VOTED:
        return 'Най-високо оценени';
      case ImageOrderFilter.TOP_VOTED_LAST_3_DAYS:
        return 'Най-високо оценени последните 3 дни';
      case ImageOrderFilter.TOP_VOTED_LAST_WEEK:
        return 'Най-високо оценени последната седмица';
      case ImageOrderFilter.TOP_VOTED_LAST_MONTH:
        return 'Най-високо оценени последния месец';
    }
  }

  selectOrderFilter(orderStr: string) {
    this.isOpen = false;
    const orderFilter = ImageOrderFilter[orderStr as keyof typeof ImageOrderFilter];
    if (orderFilter && orderFilter !== this.orderOptions.selectedFilter) {
      const persistedQueryParams: Params = {
        order: orderFilter,
        page: 1
      };

      if (orderFilter != ImageOrderFilter.NEWEST && orderFilter != ImageOrderFilter.OLDEST) {
        persistedQueryParams.approved = true;
        persistedQueryParams.pending = false;
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: persistedQueryParams,
        queryParamsHandling: 'merge'
      });
    }
  }
}
