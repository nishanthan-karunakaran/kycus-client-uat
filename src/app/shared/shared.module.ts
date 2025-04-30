import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  BellRing,
  Check,
  CheckCircle,
  CloudUpload,
  Download,
  Eye,
  FileMinus,
  FileText,
  Info,
  Landmark,
  LaptopMinimalCheck,
  Loader,
  LoaderCircle,
  LucideAngularModule,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  User,
  UserRound,
  Wallet,
  X,
  XCircle,
} from 'lucide-angular';
import { InputFormatDirective } from 'src/app/core/directives/input-format.directive';
import { InputComponent } from 'src/app/shared/ui/input/input.component';
import { ModalComponent } from 'src/app/shared/ui/modal/modal.component';
import { OtpComponent } from 'src/app/shared/ui/otp/otp.component';
import { ToastComponent } from 'src/app/shared/ui/toast/toast.component';
import { ButtonComponent } from './ui/button/button.component';
import { FilenameComponent } from './ui/filename/filename.component';
import { InputDebounceComponent } from './ui/input-debounce/input-debounce.component';
import { PaginationComponent } from './ui/pagination/pagination.component';
import { SelectComponent } from './ui/select/select.component';
import { SheetComponent } from './ui/sheet/sheet.component';
import { TableComponent } from './ui/table/table.component';
import { UploadButtonComponent } from './ui/upload-button/upload-button.component';
import { PresentValuesPipe } from '@core/pipes/presentValues.pipe';

@NgModule({
  declarations: [
    ToastComponent,
    ModalComponent,
    OtpComponent,
    InputComponent,
    InputDebounceComponent,
    TableComponent,
    SheetComponent,
    ButtonComponent,
    PaginationComponent,
    UploadButtonComponent,
    FilenameComponent,
    SelectComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputFormatDirective,
    PresentValuesPipe,
    LucideAngularModule.pick({
      X,
      CheckCircle,
      XCircle,
      AlertTriangle,
      Info,
      AlertOctagon,
      Check,
      UserRound,
      User,
      Bell,
      Landmark,
      Wallet,
      FileText,
      LaptopMinimalCheck,
      ArrowUp,
      ArrowDown,
      ArrowUpDown,
      SlidersHorizontal,
      Eye,
      Download,
      BellRing,
      Upload,
      Search,
      ArrowLeft,
      ArrowRight,
      CloudUpload,
      FileMinus,
      Trash2,
      Plus,
      Loader,
      LoaderCircle,
    }),
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputFormatDirective,
    PresentValuesPipe,
    LucideAngularModule,
    ToastComponent,
    ModalComponent,
    OtpComponent,
    InputComponent,
    InputDebounceComponent,
    TableComponent,
    SheetComponent,
    ButtonComponent,
    PaginationComponent,
    UploadButtonComponent,
    FilenameComponent,
    SelectComponent,
  ],
})
export class SharedModule {}
