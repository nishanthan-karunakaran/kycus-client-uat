import { Component } from '@angular/core';
import { Toast } from './toast.service';

export const DEFAULT_TOAST_OPTIONS = {
  duration: 2000,
  dismissable: false,
  outlined: false,
  autoClose: true,
} as const;

@Component({
  selector: 'ui-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  toasts: Toast[] = [];

  addToast(toast: Toast) {
    const newToast = {
      id: this.toasts.length + 1,
      ...toast,
      animationClass: 'animate-toast-in',
      options: {
        duration: toast.options.duration ?? DEFAULT_TOAST_OPTIONS.duration,
        dismissable: toast.options.dismissable ?? DEFAULT_TOAST_OPTIONS.dismissable,
        outlined: toast.options.outlined ?? DEFAULT_TOAST_OPTIONS.outlined,
        autoClose: toast.options.autoClose ?? DEFAULT_TOAST_OPTIONS.autoClose,
      },
    };

    this.toasts = [newToast, ...this.toasts]; // add new toast to the top

    if (newToast.options.autoClose) {
      setTimeout(() => this.removeToast(newToast), newToast.options.duration);
    }
  }

  removeToast(toast: Toast) {
    const index = this.toasts.findIndex((t) => t.id === toast.id);
    if (index === -1) return;

    // Update animation class first
    this.toasts[index].animationClass = 'animate-toast-out';

    // Wait for animation to complete before removing from array
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== toast.id);
    }, 300); // Match animation duration
  }

  toastClasses(toast: Toast) {
    return {
      // Normal filled background styles with white text
      'bg-success text-white': toast.type === 'success' && !toast.options.outlined,
      'bg-error text-white': toast.type === 'error' && !toast.options.outlined,
      'bg-warning text-white': toast.type === 'warning' && !toast.options.outlined,
      'bg-info text-white': toast.type === 'info' && !toast.options.outlined,
      'bg-danger text-white': toast.type === 'danger' && !toast.options.outlined,

      // Outlined styles with dark text
      'border border-success bg-successLight text-success':
        toast.type === 'success' && toast.options.outlined,
      'border border-error bg-failureLight text-failure':
        toast.type === 'error' && toast.options.outlined,
      'border border-warning bg-warningLight text-warning':
        toast.type === 'warning' && toast.options.outlined,
      'border border-info bg-infoLight text-info': toast.type === 'info' && toast.options.outlined,
      'border border-danger bg-dangerLight text-danger':
        toast.type === 'danger' && toast.options.outlined,

      ...(toast.animationClass ? { [toast.animationClass]: true } : {}),
    };
  }

  textColor(toast: Toast) {
    if (toast.options.outlined) {
      return (
        {
          success: 'text-success',
          error: 'text-failure',
          warning: 'text-warning',
          info: 'text-info',
          danger: 'text-danger',
        }[toast.type] || 'text-black'
      );
    }

    return 'text-white';
  }

  toastIcon(type: Toast['type']): string {
    const icons = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info',
      danger: 'alert-octagon',
    };
    return icons[type] || 'bell';
  }

  trackToast(_: number, toast: Toast) {
    return toast.id;
  }
}
