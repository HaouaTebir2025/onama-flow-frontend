import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-suivi-candidature',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './suivi-candidature.html',
  styleUrls: ['./suivi-candidature.scss']
})
export class SuiviCandidatureComponent implements OnInit {
  user: any;
  candidature: any = null;
  isLoading = true;

  constructor(private api: ApiService) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  ngOnInit() {
    this.chargerCandidature();
  }

  chargerCandidature() {
    this.api.getMaCandidature().subscribe({
      next: (response: any) => {
        this.candidature = response.candidature;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'bg-orange-100 text-orange-800',
      'VALIDE_SEC': 'bg-blue-100 text-blue-800',
      'REJETE_SEC': 'bg-red-100 text-red-800',
      'DRH_EN_ATTENTE': 'bg-purple-100 text-purple-800',
      'VALIDE_DRH': 'bg-green-100 text-green-800',
      'REJETE_DRH': 'bg-red-100 text-red-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }

  getStatutIcon(statut: string): string {
    const icons: any = {
      'EN_ATTENTE': '⏳',
      'VALIDE_SEC': '✅',
      'REJETE_SEC': '❌',
      'DRH_EN_ATTENTE': '📋',
      'VALIDE_DRH': '🎉',
      'REJETE_DRH': '❌'
    };
    return icons[statut] || '📌';
  }

  getStatutMessage(statut: string): string {
    const messages: any = {
      'EN_ATTENTE': 'Votre dossier est en cours d\'examen par le secrétariat.',
      'VALIDE_SEC': 'Votre dossier a été validé et transmis à la DRH.',
      'REJETE_SEC': 'Votre dossier n\'a pas été retenu par le secrétariat.',
      'DRH_EN_ATTENTE': 'Votre dossier est en cours d\'examen par la DRH.',
      'VALIDE_DRH': 'Félicitations ! Votre candidature est acceptée.',
      'REJETE_DRH': 'Votre candidature n\'a pas été retenue.'
    };
    return messages[statut] || 'En attente de traitement.';
  }

  getEtapeProgress(statut: string): number {
    const steps: any = {
      'EN_ATTENTE': 25,
      'VALIDE_SEC': 50,
      'DRH_EN_ATTENTE': 75,
      'VALIDE_DRH': 100,
      'REJETE_SEC': 100,
      'REJETE_DRH': 100
    };
    return steps[statut] || 0;
  }
}