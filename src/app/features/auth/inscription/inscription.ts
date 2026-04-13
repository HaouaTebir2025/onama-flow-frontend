import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.scss']
})
export class InscriptionComponent {
  form = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    universite: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showPassword = false;
  showConfirmPassword = false;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {}

  get passwordMatch(): boolean {
    return this.form.password === this.form.confirmPassword;
  }

  get formulaireValide(): boolean {
    return this.form.nom.trim().length >= 2 &&
           this.form.prenom.trim().length >= 2 &&
           this.form.email.includes('@') &&
           this.form.email.includes('.') &&
           this.form.universite.trim().length >= 2 &&
           this.form.password.length >= 6 &&
           this.passwordMatch;
  }

  // Méthode pour rediriger vers la page de connexion
  allerVersLogin() {
    this.router.navigate(['/login']);
  }

  inscription() {
    if (!this.formulaireValide) {
      this.message = '❌ Veuillez remplir correctement tous les champs';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.http.post(`${this.apiUrl}/register`, {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      email: this.form.email.trim().toLowerCase(),
      telephone: this.form.telephone,
      universite: this.form.universite.trim(),
      password: this.form.password
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.message = '✅ Inscription réussie ! Connectez-vous pour déposer votre lettre.';
          this.messageType = 'success';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.message = '❌ ' + (response.message || 'Erreur lors de l\'inscription');
          this.messageType = 'error';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
        this.message = err.error?.message || '❌ Erreur lors de l\'inscription';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}