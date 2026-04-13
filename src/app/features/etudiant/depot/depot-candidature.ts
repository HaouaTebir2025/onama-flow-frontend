import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-depot-candidature',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './depot-candidature.html',
  styleUrls: ['./depot-candidature.scss']
})
export class DepotCandidatureComponent implements OnInit {
  user: any;
  candidature = {
    periodeSouhaitee: '',
    telephone: '',
    universite: '',
    cv: null as File | null,
    lettre: null as File | null
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  numeroDossier = '';

  constructor(private api: ApiService, private router: Router) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.candidature.telephone = this.user.telephone || '';
      this.candidature.universite = this.user.universite || '';
    } else {
      this.router.navigate(['/connexion-etudiant']);
    }
  }

  ngOnInit() {
    this.checkExistingCandidature();
  }

  checkExistingCandidature() {
    this.api.getMaCandidature().subscribe({
      next: (response: any) => {
        if (response.candidature && 
            ['EN_ATTENTE', 'VALIDE_SEC', 'DRH_EN_ATTENTE'].includes(response.candidature.statutCandidature)) {
          this.errorMessage = `Vous avez déjà une candidature en cours (n°${response.candidature.numeroDossier})`;
        }
      },
      error: () => {}
    });
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(ext)) {
        this.errorMessage = 'Format non autorisé. Utilisez PDF, DOC ou DOCX';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Fichier trop volumineux (max 5 MB)';
        return;
      }
      if (type === 'cv') {
        this.candidature.cv = file;
      } else {
        this.candidature.lettre = file;
      }
    }
  }

  onSubmit() {
    if (!this.candidature.cv || !this.candidature.lettre) {
      this.errorMessage = 'Veuillez joindre votre CV et votre lettre de motivation';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('cv', this.candidature.cv);
    formData.append('lettre', this.candidature.lettre);
    formData.append('periodeSouhaitee', this.candidature.periodeSouhaitee);
    formData.append('telephone', this.candidature.telephone);
    formData.append('universite', this.candidature.universite);

    this.api.deposerCandidature(formData).subscribe({
      next: (response: any) => {
        this.numeroDossier = response.numeroDossier;
        this.successMessage = `Candidature déposée avec succès ! Votre numéro de dossier est : ${response.numeroDossier}`;
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/etudiant/confirmation'], { 
            queryParams: { numeroDossier: this.numeroDossier }
          });
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Erreur lors du dépôt';
        this.isLoading = false;
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}