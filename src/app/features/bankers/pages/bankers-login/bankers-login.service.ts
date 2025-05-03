import { Injectable } from '@angular/core';
import { API_URL } from 'src/app/core/constants/apiurls';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class BankersLoginService {
  constructor(private api: ApiService) {}

  requestOTP(data: { email: string }) {
    return this.api.post(API_URL.BANKERS.REQUEST_OTP, data);
  }

  verifyOTP(data: { email: string; otp: string }) {
    return this.api.post(API_URL.BANKERS.VERIFY_OTP, data);
  }
}
