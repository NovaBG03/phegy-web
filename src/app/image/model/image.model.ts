import {SafeUrl} from "@angular/platform-browser";

export interface Image {
  id: number,
  title: string,
  description?: string,
  imageUrl: SafeUrl,
  publisherUsername: string,
  publishedOn: Date,
  isApproved?: boolean,
  points: number
}

export interface ImagePage {
  images: Image[],
  totalCount: number
}

export interface ImageFilter {
  publishFilter?: ImagePublishFilter,
  orderFilter?: ImageOrderFilter,
  publisher?: string
}

export enum ImagePublishFilter {
  ALL = 'ALL',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING'
}

export enum ImageOrderFilter {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  LATEST_VOTED = 'LATEST_VOTED',
  MOST_VOTED = 'MOST_VOTED',
  TOP_VOTED_LAST_3_DAYS = 'TOP_VOTED_LAST_3_DAYS',
  TOP_VOTED_LAST_WEEK = 'TOP_VOTED_LAST_WEEK',
  TOP_VOTED_LAST_MONTH = 'TOP_VOTED_LAST_MONTH'
}

export interface OrderOptions {
  selectedFilter: ImageOrderFilter,
  isTimeOrderAllowed: boolean,
  isTippedOrderAllowed: boolean,
  isTopFilterAllowed: boolean
}
