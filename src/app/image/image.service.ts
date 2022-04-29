import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {ImagePageResponseDto, ImageDto} from "./model/image.dto";
import {Image, ImageFilter, ImagePage} from "./model/image.model";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({providedIn: 'root'})
export class ImageService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
  }

  getImages(page: number, size: number, options?: ImageFilter): Observable<ImagePage> {
    const url = `${environment.phegyApiUrl}/api/v1/image`;
    const params = {page, size, ...options};
    return this.http.get<ImagePageResponseDto>(url, {params})
      .pipe(
        map(dto => {
          return {
            images: dto.images.map(image => this.imageResponseDtoToImage(image)),
            totalCount: dto.totalCount
          };
        })
      );
  }

  postImage(image: Blob, title: string, description: string): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/image`;
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('description', description);

    return this.http.post(url, formData, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';

          switch (err.error.message) {
            case 'USER_NOT_CONFIRMED':
              message = 'Трябва да потвърдите електронната си поща преди да качите снимка';
              break;
          }

          return throwError(message);
        })
      );
  }

  approveImage(imageId: number): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/image/approve/${imageId}`
    return this.http.post(url, {}, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';

          switch (err.error.message) {
            case 'IMAGE_ALREADY_APPROVED':
              message = 'Снимката вече е била одобрена';
              break;
            case 'USER_NOT_CONFIRMED':
              message = 'Трябва да потвърдите електронната си поща преди да имате достъп до тази фукнционалнст';
              break;
          }

          return throwError(message);
        })
      );
  }

  rejectImage(imageId: number): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/image/reject/${imageId}`;
    return this.http.delete(url, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';

          switch (err.error.message) {
            case 'IMAGE_ALREADY_APPROVED':
              message = 'Снимката вече е била одобрена';
              break;
            case 'USER_NOT_CONFIRMED':
              message = 'Трябва да потвърдите електронната си поща преди да имате достъп до тази фукнционалнст';
              break;
          }

          return throwError(message);
        })
      );
  }


  deleteImage(imageId: number): Observable<any> {
    const url = `${environment.phegyApiUrl}/api/v1/image/${imageId}`;
    return this.http.delete(url, {observe: 'response'})
      .pipe(
        catchError(err => {
          let message = 'Нещо се обърка!';

          switch (err.error.message) {
            case 'CAN_NOT_DELETE_FOREIGN_IMAGE':
              message = 'Нямате право да триете тази снимка';
              break;
            case 'USER_NOT_CONFIRMED':
              message = 'Трябва да потвърдите електронната си поща преди да имате достъп до тази фукнционалнст';
              break;
          }

          return throwError(message);
        })
      );
  }

  private imageResponseDtoToImage(dto: ImageDto): Image {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      imageUrl: this.createImageUrl(dto.imageKey),
      publisherUsername: dto.publisherUsername,
      publishedOn: new Date(dto.publishedOn),
      isApproved: dto.approved,
      points: dto.points
    };
  }

  private createImageUrl(imageKey: string) {
    const objectUrl = `${environment.phegyCdnUrl}/image/${imageKey}`;
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }
}
