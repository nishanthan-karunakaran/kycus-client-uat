import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '@core/services/helpers.service';

@Pipe({
  name: 'presentValues',
  standalone: true,
})
export class PresentValuesPipe implements PipeTransform {
  constructor(private helperService: HelperService) {}

  transform<T extends Record<string, unknown>>(value: T): Array<[string, T[keyof T]]> {
    if (!value || typeof value !== 'object') return [];

    return Object.entries(value)
      .filter(([, val]) => val !== null && val !== undefined && val !== '')
      .map(([key, val]) => [this.helperService.toTitleCase(key), val as T[keyof T]]);
  }
}
