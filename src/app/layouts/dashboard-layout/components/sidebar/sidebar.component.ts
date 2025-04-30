import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Link {
  name: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  accessLinks: Link[] = [
    {
      name: 'Entity',
      link: '/entity',
      icon: 'landmark',
    },
    {
      name: 'Consent',
      link: '/consent',
      icon: 'file-text',
    },
    {
      name: 'Wallet',
      link: '/wallet',
      icon: 'wallet',
    },
    {
      name: 'Re-KYC',
      link: '/rekyc',
      icon: 'laptop-minimal-check',
    },
  ];

  constructor(private router: Router) {}

  handleAccessLink(link: string) {
    this.router.navigate([link]);
  }

  trackLink(_: number, item: Link): string {
    return item.link;
  }
}
