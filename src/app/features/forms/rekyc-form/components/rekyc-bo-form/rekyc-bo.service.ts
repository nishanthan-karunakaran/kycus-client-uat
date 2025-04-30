import { Injectable } from '@angular/core';
import { API_URL } from '@core/constants/apiurls';
import { ApiService } from '@core/services/api.service';
import { SaveBODetails } from '@features/forms/rekyc-form/rekyc-form.model';

@Injectable({
  providedIn: 'root',
})
export class RekycBoService {
  constructor(private api: ApiService) {}

  saveBODetails(data: SaveBODetails) {
    return this.api.post(API_URL.APPLICATION.REKYC.DECLARATION_FORM.BO.SAVE, data);
  }

  getBODetails(entityId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.DECLARATION_FORM.BO.GET(entityId));
  }
}
