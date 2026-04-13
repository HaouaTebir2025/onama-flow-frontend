import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nouveau-dossier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nouveau-dossier.html',
  styleUrls: ['./nouveau-dossier.scss']
})
export class NouveauDossierComponent {
  form = {
    nom: '',
    prenom: '',
    telephone: '',
    universite: '',
    type: 'ACADEMIQUE'
  };

  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {}

  get formulaireValide(): boolean {
    return this.form.nom.trim().length >= 2 &&
           this.form.prenom.trim().length >= 2 &&
           this.form.universite.trim().length >= 2;
  }

  enregistrer() {
    if (!this.formulaireValide) {
      this.message = '❌ Veuillez remplir tous les champs obligatoires';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${this.apiUrl}/stagiaires`, this.form, { headers })
      .subscribe({
        next: () => {
          this.message = '✅ Dossier enregistré avec succès !';
          this.messageType = 'success';
          this.isLoading = false;
          
          this.form = { nom: '', prenom: '', telephone: '', universite: '', type: 'ACADEMIQUE' };
          
          setTimeout(() => {
            this.message = '';
            this.router.navigate(['/dashboard/secretariat/liste']);
          }, 2000);
        },
        error: () => {
          this.message = '❌ Erreur lors de l\'enregistrement';
          this.messageType = 'error';
          this.isLoading = false;
        }
      });
  }

  annuler() {
    this.router.navigate(['/dashboard/secretariat/liste']);
  }
}