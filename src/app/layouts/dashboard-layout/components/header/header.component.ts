import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Icon {
  name: string;
  color: string;
  size: string;
}

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  iconsArr: Icon[] = [
    {
      name: 'Bell',
      color: 'white',
      size: '20',
    },
    {
      name: 'UserRound',
      color: 'white',
      size: '22',
    },
  ];

  constructor(private router: Router) {}

  trackIcon(_: number, item: Icon): string {
    return item.name;
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  handleIconClick(icon: string) {
    // eslint-disable-next-line no-console
    console.log(icon);
  }
}
