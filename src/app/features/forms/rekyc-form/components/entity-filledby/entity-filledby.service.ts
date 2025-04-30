import { Injectable } from '@angular/core';
import { API_URL } from '@core/constants/apiurls';
import { ApiService } from '@core/services/api.service';
import { EntityFilledBy } from './entity-filledby.model';

@Injectable({
  providedIn: 'root',
})
export class RekycEntityFilledbyService {
  constructor(private api: ApiService) {}

  updateEntityFilledBy(data: EntityFilledBy) {
    if (data.email) {
      return this.api.post(API_URL.APPLICATION.REKYC.ENTITY_INFO.ENTITY_FILLED_BY_OTHERS, data);
    }

    return this.api.post(API_URL.APPLICATION.REKYC.ENTITY_INFO.ENTITY_FILLED_BY, data);
  }

  fetchAusList(ausId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.AUS_LIST(ausId));
  }
}
