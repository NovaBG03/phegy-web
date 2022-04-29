import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'noComma'})
export class NoCommaPipe implements PipeTransform {

  transform(val: string | null): string {
    if (val) {
      return val.replace(/,/g, ' ');
    }

    return '';
  }
}
