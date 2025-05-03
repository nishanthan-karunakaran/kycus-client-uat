import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface MenuItem {
  label: string;
  link?: string;
  icon?: string;
  children?: MenuItem[]; // For submenus
  navigateTo?: boolean; // Optional custom navigation flag
}

@Component({
  selector: 'ui-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  @Input() menuItems: MenuItem[] = [];
  @Output() optionSelected = new EventEmitter<MenuItem>();

  onMenuItemClick(item: MenuItem): void {
    if (item.link && item.navigateTo !== false) {
      window.location.href = item.link; // Default navigation
    }
    this.optionSelected.emit(item); // Emit the selected menu item
  }

  hasChildren(item: MenuItem) {
    return item.children && item.children.length > 0;
  }

  trackByFn(index: number, item: MenuItem): string {
    return item.label; // Use a unique property of MenuItem as the identifier
  }
}
