import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-stagiaire-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stagiaire-layout.html',
  styleUrls: ['./stagiaire-layout.scss']
})
export class StagiaireLayoutComponent {
  user: any;

  constructor(private router: Router) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}