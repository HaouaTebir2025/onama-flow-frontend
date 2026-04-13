import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-liste-candidatures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-candidatures.html',
  styleUrls: ['./liste-candidatures.scss']
})
export class ListeCandidaturesComponent implements OnInit {
  candidatures: any[] = [];
  isLoading = true;
  selectedCandidature: any = null;
  showModal = false;
  commentaire = '';
  actionType: 'valider' | 'rejeter' = 'valider';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerCandidatures();
  }

  chargerCandidatures() {
    this.isLoading = true;
    this.message = '';
    this.api.getCandidaturesEnAttente().subscribe({
      next: (data) => {
        this.candidatures = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.message = '❌ Erreur de chargement des candidatures';
        this.messageType = 'error';
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
      this.api.validerCandidature(this.selectedCandidature.id, this.commentaire).subscribe({
        next: () => {
          this.message = `✅ Candidature de ${this.selectedCandidature.prenom} ${this.selectedCandidature.nom} validée et transmise à la DRH`;
          this.messageType = 'success';
          this.fermerModal();
          this.chargerCandidatures();
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Erreur lors de la validation';
          this.messageType = 'error';
          this.fermerModal();
          setTimeout(() => this.message = '', 3000);
        }
      });
    } else {
      if (!this.commentaire) {
        this.message = '❌ Veuillez saisir un motif de rejet';
        this.messageType = 'error';
        setTimeout(() => this.message = '', 3000);
        return;
      }
      this.api.rejeterCandidature(this.selectedCandidature.id, this.commentaire).subscribe({
        next: () => {
          this.message = `❌ Candidature de ${this.selectedCandidature.prenom} ${this.selectedCandidature.nom} rejetée`;
          this.messageType = 'success';
          this.fermerModal();
          this.chargerCandidatures();
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Erreur lors du rejet';
          this.messageType = 'error';
          this.fermerModal();
          setTimeout(() => this.message = '', 3000);
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
      error: (err) => {
        console.error(err);
        this.message = '❌ Erreur lors du téléchargement';
        this.messageType = 'error';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'VALIDE_SEC': 'bg-green-100 text-green-800',
      'REJETE_SEC': 'bg-red-100 text-red-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }
}