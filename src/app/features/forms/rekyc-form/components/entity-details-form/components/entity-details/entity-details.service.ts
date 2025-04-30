import { Injectable } from '@angular/core';
import { API_URL } from '@core/constants/apiurls';
import { ApiService } from '@core/services/api.service';
import { DocResponse } from '@features/forms/rekyc-form/components/entity-details-form/entity-details-form.model';
import {
  BasicDoc,
  Doc,
  EntityDetails,
  ProofDoc,
} from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.state';
import { UploadFileProof } from '@features/forms/rekyc-form/rekyc-form.model';

@Injectable({
  providedIn: 'root',
})
export class EntityDetailsService {
  constructor(private api: ApiService) {}

  uploadFileProof(data: UploadFileProof) {
    return this.api.post(API_URL.APPLICATION.REKYC.ENTITY_DETAILS_FORM.ENTITY_DOCS_UPLOAD, data);
  }

  getEntityDetails(entityId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.ENTITY_DETAILS_FORM.ENTITY_DETAILS(entityId));
  }

  previewEntityDetails(entityId: string) {
    return this.api.get(API_URL.APPLICATION.REKYC.ENTITY_DETAILS_FORM.PREVIEW_DETAILS(entityId));
  }

  transformToEntityDetails = (
    docResponse: Record<keyof EntityDetails, DocResponse>,
    entityDetails: EntityDetails, // Pass in the existing entityDetails state
  ): EntityDetails => {
    // Helper function to map DocResponse to BasicDoc or ProofDoc, and only update the file label
    const transformDoc = (
      docResponse: DocResponse,
      isProofDoc = false,
      existingDoc: BasicDoc | ProofDoc,
    ): BasicDoc | ProofDoc => {
      const file: Doc = {
        ...existingDoc.file, // Retain the existing file object (name, link, etc.)
        name: docResponse.fileName, // Update the name (label)
        link: docResponse.url, // Update the link
        selectedType: docResponse.selectedType || existingDoc.file.selectedType, // Update selectedType if present, else keep existing
      };

      if (isProofDoc) {
        return {
          ...existingDoc, // Retain the existing ProofDoc properties
          // label: docResponse.fileName, // Update only the label
          file: file, // Update the file object
        } as ProofDoc;
      } else {
        return {
          ...existingDoc, // Retain the existing BasicDoc properties
          // label: docResponse.fileName, // Update only the label
          file: file, // Update the file object
        } as BasicDoc;
      }
    };

    return {
      pan: docResponse.pan
        ? transformDoc(docResponse.pan, false, entityDetails.pan)
        : entityDetails.pan,
      gstin: docResponse.gstin
        ? transformDoc(docResponse.gstin, false, entityDetails.gstin)
        : entityDetails.gstin,
      addressProof: docResponse.addressProof
        ? (transformDoc(docResponse.addressProof, true, entityDetails.addressProof) as ProofDoc)
        : entityDetails.addressProof,
      coi: docResponse.coi
        ? transformDoc(docResponse.coi, false, entityDetails.coi)
        : entityDetails.coi,
      moa: docResponse.moa
        ? transformDoc(docResponse.moa, false, entityDetails.moa)
        : entityDetails.moa,
      aoa: docResponse.aoa
        ? transformDoc(docResponse.aoa, false, entityDetails.aoa)
        : entityDetails.aoa,
    };
  };
}
