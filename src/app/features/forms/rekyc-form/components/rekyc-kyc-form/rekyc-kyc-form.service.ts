/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { API_URL } from '@core/constants/apiurls';
import { ApiService } from '@core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class RekycKycFormService {
  constructor(private api: ApiService) {}

  downloadReKycForm(data: any) {
    fetch('http://localhost:3000/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Failed to generate PDF');
      })
      .then((blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
      });
  }

  fetchFormData(entityId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.REKYC_FORM.GET(entityId));
  }

  savePDF(data: any, entityId: string) {
    return this.api.put(API_URL.APPLICATION.REKYC.REKYC_FORM.PUT(entityId), data);
  }

  getReport(entityId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.REPORT.GET_REPORT(entityId));
  }
}
