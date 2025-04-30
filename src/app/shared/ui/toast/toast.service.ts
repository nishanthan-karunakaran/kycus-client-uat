import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
} from '@angular/core';
import { ToastComponent } from './toast.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'danger';

export interface Toast {
  id?: string | number;
  type: ToastType;
  message: string;
  options: ToastOptions;
  animationClass?: string;
}

export interface ToastOptions {
  duration?: number;
  dismissable?: boolean;
  outlined?: boolean;
  autoClose?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastContainerRef?: ComponentRef<ToastComponent>;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector,
  ) {}

  private createToastContainer() {
    const componentRef = createComponent(ToastComponent, {
      environmentInjector: this.environmentInjector,
    });
    this.toastContainerRef = componentRef;

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);
  }

  private ensureToastContainer() {
    if (!this.toastContainerRef) {
      this.createToastContainer();
    }
  }

  private show(type: ToastType, message: string, options: ToastOptions = {}) {
    this.ensureToastContainer();
    this.toastContainerRef?.instance.addToast({ type, message, options });
  }

  success(message: string, options: ToastOptions = {}) {
    this.show('success', message, options);
  }

  error(message: string, options: ToastOptions = {}) {
    this.show('error', message, options);
  }

  warning(message: string, options: ToastOptions = {}) {
    this.show('warning', message, options);
  }

  info(message: string, options: ToastOptions = {}) {
    this.show('info', message, options);
  }

  danger(message: string, options: ToastOptions = {}) {
    this.show('danger', message, options);
  }
}
