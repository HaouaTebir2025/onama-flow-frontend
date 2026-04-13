import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.scss']
})
export class ProfilComponent implements OnInit {
  user: any = {
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: ''
  };

  form = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  dateDuJour: string = '';

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {
    this.chargerUtilisateur();
    
    const today = new Date();
    this.dateDuJour = today.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  ngOnInit() {}

  chargerUtilisateur() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.form.nom = this.user.nom;
      this.form.prenom = this.user.prenom || '';
      this.form.email = this.user.email;
      this.form.telephone = this.user.telephone || '';
    }
  }

  get passwordMatch(): boolean {
    return this.form.newPassword === this.form.confirmPassword;
  }

  get formulaireValide(): boolean {
    return this.form.nom.trim().length >= 2 &&
           this.form.prenom.trim().length >= 2 &&
           this.form.email.includes('@') &&
           this.form.email.includes('.');
  }

  get hasPasswordChange(): boolean {
    return this.form.currentPassword !== '' || this.form.newPassword !== '' || this.form.confirmPassword !== '';
  }

  getInitiales(prenom: string, nom: string): string {
    return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
  }

  mettreAJourProfil() {
    if (!this.formulaireValide) {
      this.message = '❌ Veuillez remplir correctement les champs';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const updateData: any = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      email: this.form.email.trim().toLowerCase(),
      telephone: this.form.telephone
    };

    // Si changement de mot de passe
    if (this.hasPasswordChange) {
      if (!this.form.currentPassword) {
        this.message = '❌ Veuillez saisir votre mot de passe actuel';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }
      if (this.form.newPassword.length < 6) {
        this.message = '❌ Le nouveau mot de passe doit contenir au moins 6 caractères';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }
      if (!this.passwordMatch) {
        this.message = '❌ Les nouveaux mots de passe ne correspondent pas';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }
      
      updateData.currentPassword = this.form.currentPassword;
      updateData.newPassword = this.form.newPassword;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    this.http.put(`${this.apiUrl}/profile`, updateData, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Mettre à jour l'utilisateur dans localStorage
          const updatedUser = { ...this.user, ...response.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.user = updatedUser;
          
          this.message = '✅ Profil mis à jour avec succès';
          this.messageType = 'success';
          
          // Réinitialiser les champs de mot de passe
          this.form.currentPassword = '';
          this.form.newPassword = '';
          this.form.confirmPassword = '';
          
          setTimeout(() => this.message = '', 3000);
        } else {
          this.message = '❌ ' + (response.message || 'Erreur lors de la mise à jour');
          this.messageType = 'error';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message = err.error?.message || '❌ Erreur lors de la mise à jour';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  annuler() {
    this.router.navigate(['/dashboard/accueil']);
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}