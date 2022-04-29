export interface ImageDto {
  id: number,
  title: string,
  description?: string,
  imageKey: string,
  publisherUsername: string,
  publishedOn: string,
  approved?: boolean,
  points: number
}

export interface ImagePageResponseDto {
  images: ImageDto[],
  totalCount: number
}
