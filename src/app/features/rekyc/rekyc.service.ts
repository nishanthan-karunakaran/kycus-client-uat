import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/core/constants/apiurls';
import { ApiService } from 'src/app/core/services/api.service';
import { GetReKycApplicationsParams, SubmitReKycExcel, UploadReKycExcel } from './rekyc.model';

@Injectable({
  providedIn: 'root',
})
export class RekycService {
  constructor(private api: ApiService) {}

  uploadExcel(data: UploadReKycExcel) {
    return this.api.post(API_URL.REKYC.UPLOAD_EXCEL, data);
  }

  submitExcel(data: SubmitReKycExcel) {
    return this.api.post(API_URL.REKYC.SUBMIT_EXCEL, data);
  }

  getReKycApplications(params?: GetReKycApplicationsParams) {
    let queryParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams = queryParams.set(key, value.toString());
        }
      });
    }

    return this.api.get(API_URL.APPLICATION.REKYC.APPLICATIONS, queryParams);
  }
}
