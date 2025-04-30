import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/core/constants/apiurls';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class EmailValidationService {
  constructor(private api: ApiService) {}

  requestOTP(data: { token: string; email: string }) {
    return this.api.post(API_URL.APPLICATION.REKYC.AUTH.REQUEST_OTP, data);
  }
}
