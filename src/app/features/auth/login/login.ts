import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoading = false;
  showPassword = false;
  rememberMe = false;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.error = 'Veuillez saisir un email valide';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.http.post(`${this.apiUrl}/login`, {
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: (response: any) => {
        // ✅ CORRECTION ICI : accessToken au lieu de token
        if (response.success && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          if (this.rememberMe) {
            localStorage.setItem('savedEmail', this.email);
          } else {
            localStorage.removeItem('savedEmail');
          }
          
          // Redirection selon le rôle
          const role = response.user.role;
          if (role === 'ETUDIANT') {
            this.router.navigate(['/etudiant/depot']);
          } else if (role === 'SECRETARIAT') {
            this.router.navigate(['/dashboard/secretariat/candidatures']);
          } else if (role === 'DRH') {
            this.router.navigate(['/dashboard/drh/candidatures']);
          } else if (role === 'DIRECTEUR') {
            this.router.navigate(['/dashboard/direction/planning']);
          } else if (role === 'CHEF_SERVICE') {
            this.router.navigate(['/dashboard/chef-service/evaluation']);
          } else {
            this.router.navigate(['/dashboard/accueil']);
          }
        } else {
          this.error = response.message || 'Email ou mot de passe incorrect';
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error = 'Serveur indisponible. Vérifiez que le backend est démarré.';
        } else if (err.status === 401) {
          this.error = 'Email ou mot de passe incorrect';
        } else if (err.status === 429) {
          this.error = 'Trop de tentatives. Réessayez dans 15 minutes.';
        } else if (err.status === 500) {
          this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.error = 'Erreur de connexion au serveur';
        }
        this.isLoading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}