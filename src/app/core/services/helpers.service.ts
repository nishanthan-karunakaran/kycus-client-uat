import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  public toTitleCase(
    txt: string,
    splitBy: 'camelCase' | 'underscore' | 'space' = 'camelCase',
  ): string {
    let words: string[];

    switch (splitBy) {
      case 'underscore':
        words = txt.split('_');
        break;
      case 'space':
        words = txt.split(' ');
        break;
      default: // camelCase (default)
        words = txt.replace(/([A-Z])/g, ' $1').split(' ');
    }

    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  public toCamelCase(txt: string) {
    return txt
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}
