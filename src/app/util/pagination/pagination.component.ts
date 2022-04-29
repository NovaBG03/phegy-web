import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  lastPage = 1;

  @Input() set elementsCount(count: number) {
    this.lastPage = Math.ceil(count / this.size);

    if (this.lastPage < this.currentPage) {
      this.invalidPage.next();
    }
  }

  @Input() currentPage = 1;
  @Input() size = environment.defaultPageSize;

  @Output() nextPage = new EventEmitter<number>();
  @Output() invalidPage = new EventEmitter<void>();

  get firstDots(): string {
    return this.currentPage - 1 === 3 ? '2' : '...';
  }

  get secondDots(): string {
    return this.lastPage - this.currentPage === 3
    || (this.currentPage === 1 && this.lastPage === 5)
      ? (this.lastPage - 1).toString() : '...';
  }

  constructor() {
  }

  ngOnInit(): void {
  }

  moveToPage(page: number | string): void {
    const pageNumber = +page;
    if (!pageNumber) {
      return;
    }

    this.nextPage.next(pageNumber);
  }

}
