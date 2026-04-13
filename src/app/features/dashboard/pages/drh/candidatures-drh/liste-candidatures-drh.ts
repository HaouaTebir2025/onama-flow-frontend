import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-liste-candidatures-drh',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-candidatures-drh.html',
  styleUrls: ['./liste-candidatures-drh.scss']
})
export class ListeCandidaturesDRHComponent implements OnInit {
  candidatures: any[] = [];
  isLoading = true;
  selectedCandidature: any = null;
  showModal = false;
  commentaire = '';
  actionType: 'valider' | 'rejeter' = 'valider';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerCandidatures();
  }

  chargerCandidatures() {
    this.isLoading = true;
    this.api.getCandidaturesDRH().subscribe({
      next: (data) => {
        this.candidatures = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ouvrirModal(candidature: any, action: 'valider' | 'rejeter') {
    this.selectedCandidature = candidature;
    this.actionType = action;
    this.commentaire = '';
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
    this.selectedCandidature = null;
    this.commentaire = '';
  }

  confirmer() {
    if (!this.selectedCandidature) return;

    if (this.actionType === 'valider') {
      this.api.validerCandidatureDRH(this.selectedCandidature.id, this.commentaire).subscribe({
        next: () => {
          this.fermerModal();
          this.chargerCandidatures();
        },
        error: (err) => {
          console.error(err);
          this.fermerModal();
        }
      });
    } else {
      if (!this.commentaire) {
        alert('Veuillez saisir un motif de rejet');
        return;
      }
      this.api.rejeterCandidatureDRH(this.selectedCandidature.id, this.commentaire).subscribe({
        next: () => {
          this.fermerModal();
          this.chargerCandidatures();
        },
        error: (err) => {
          console.error(err);
          this.fermerModal();
        }
      });
    }
  }

  telechargerDocument(id: number, type: 'cv' | 'lettre') {
    this.api.telechargerDocument(id, type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'cv' ? 'CV.pdf' : 'Lettre_Motivation.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err)
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'VALIDE_SEC': 'bg-blue-100 text-blue-800',
      'DRH_EN_ATTENTE': 'bg-purple-100 text-purple-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }
}