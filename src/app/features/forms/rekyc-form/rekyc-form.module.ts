import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@src/app/shared/shared.module';
import { RekycEmailValidationComponent } from './components/email-validation/email-validation.component';
import { EntityDetailsComponent } from './components/entity-details-form/components/entity-details/entity-details.component';
import { RekycEntityFilledbyComponent } from './components/entity-filledby/entity-filledby.component';
import { RekycFormHeaderComponent } from './components/header/rekyc-form-header.component';
import { RekycDeclarationFormComponent } from './components/rekyc-declaration-form/rekyc-declaration-form.component';
import { RekycFormUploadWrapperComponent } from './components/rekyc-form-uploadWrapper/rekyc-form-uploadWrapper.component';
import { RekycHeaderSectionComponent } from './components/rekyc-kyc-form/components/rekyc-header-section/rekyc-header-section.component';
import { RekycKycFormComponent } from './components/rekyc-kyc-form/rekyc-kyc-form.component';
import { RekycPersonalDetailsComponent } from './components/rekyc-personal-details/rekyc-personal-details.component';
import { RekycFormRoutingModule } from './rekyc-form-routing.module';
import { RekycFormComponent } from './rekyc-form.component';
import { rekycFormReducers } from './store/rekyc-form.reducer';
import { RekycEntityDetailsFormComponent } from './components/entity-details-form/entity-details-form.component';
import { RekycBoFormComponent } from './components/rekyc-bo-form/rekyc-bo-form.component';
import { RekycBoInputComponent } from './components/rekyc-bo-form/components/rekyc-bo-input/rekyc-bo-input.component';
import { RekycBoFileuploadComponent } from './components/rekyc-bo-form/components/rekyc-bo-fileupload/rekyc-bo-fileupload.component';
import { PreviewEntitydetComponent } from './components/entity-details-form/components/preview-entitydet/preview-entitydet.component';
import { PreviewPersonaldetComponent } from './components/rekyc-personal-details/components/preview-pesonaldet/preview-pesonaldet.component';
import { RekycEsignComponent } from './components/rekyc-esign/rekyc-esign.component';
import { RekycDirectorsFormComponent } from './components/rekyc-directors-form/rekyc-directors-form.component';

@NgModule({
  imports: [
    SharedModule,
    RekycFormRoutingModule,
    StoreModule.forFeature('rekycForm', rekycFormReducers),
  ],
  declarations: [
    RekycFormComponent,
    RekycFormHeaderComponent,
    RekycEmailValidationComponent,
    RekycEntityFilledbyComponent,
    RekycEntityDetailsFormComponent,
    EntityDetailsComponent,
    PreviewEntitydetComponent,
    RekycDeclarationFormComponent,
    RekycDirectorsFormComponent,
    RekycBoFormComponent,
    RekycBoInputComponent,
    RekycBoFileuploadComponent,
    RekycFormUploadWrapperComponent,
    RekycPersonalDetailsComponent,
    PreviewPersonaldetComponent,
    RekycKycFormComponent,
    RekycHeaderSectionComponent,
    RekycEsignComponent,
  ],
})
export class RekycFormModule {}
