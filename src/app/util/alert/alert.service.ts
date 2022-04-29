import {Injectable} from "@angular/core";
import {PopUpModel} from "./model/pop-up-model";
import {Observable, Subject} from "rxjs";

@Injectable({providedIn: 'root'})
export class AlertService {
  private alertSubject = new Subject<PopUpModel>();

  get alert$(): Observable<PopUpModel> {
    return this.alertSubject.asObservable();
  }

  constructor() {
  }

  showAlert(model: PopUpModel) {
    this.alertSubject.next(model);
  }

  showSuccessAlert(message: string, description: string) {
    this.showAlert({
      bannerPath: 'assets/svgs/success-tick.svg',
      message: message,
      description: description,
      buttonText: 'Добре',
      buttonStyle: 'success'
    });
  }

  showErrorAlert(description: string) {
    this.showAlert({
      bannerPath: 'assets/svgs/error-cross.svg',
      message: 'Грешка',
      description: description,
      buttonText: 'Добре',
      buttonStyle: 'danger'
    })
  }
}
