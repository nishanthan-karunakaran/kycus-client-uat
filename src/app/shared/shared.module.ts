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
  CheckCheck,
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
  LogOut,
  LucideAngularModule,
  OctagonAlert,
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
import { MenuComponent } from './ui/menu/menu.component';
import { TooltipComponent } from './ui/tooltip/tooltip.component';

@NgModule({
  declarations: [
    ButtonComponent,
    FilenameComponent,
    InputComponent,
    InputDebounceComponent,
    MenuComponent,
    ModalComponent,
    OtpComponent,
    PaginationComponent,
    SelectComponent,
    SheetComponent,
    TableComponent,
    ToastComponent,
    UploadButtonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputFormatDirective,
    LucideAngularModule.pick({
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
      CheckCheck,
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
      LogOut,
      OctagonAlert,
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
    }),
    PresentValuesPipe,
    ReactiveFormsModule,
    RouterModule,
    TooltipComponent,
  ],
  exports: [
    ButtonComponent,
    CommonModule,
    FilenameComponent,
    FormsModule,
    InputComponent,
    InputDebounceComponent,
    InputFormatDirective,
    LucideAngularModule,
    MenuComponent,
    ModalComponent,
    OtpComponent,
    PaginationComponent,
    PresentValuesPipe,
    ReactiveFormsModule,
    RouterModule,
    SelectComponent,
    SheetComponent,
    TableComponent,
    ToastComponent,
    UploadButtonComponent,
  ],
})
export class SharedModule {}
