import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-suivi-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suivi-public.html',
  styleUrls: ['./suivi-public.scss']
})
export class SuiviPublicComponent {
  numeroDossier = '';
  candidature: any = null;
  isLoading = false;
  errorMessage = '';
  rechercheEffectuee = false;

  constructor(private api: ApiService) {}

  rechercher() {
    if (!this.numeroDossier.trim()) {
      this.errorMessage = 'Veuillez saisir un numéro de dossier';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.rechercheEffectuee = true;
    this.candidature = null;

    this.api.suiviCandidature(this.numeroDossier).subscribe({
      next: (response: any) => {
        this.candidature = response.candidature;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Dossier non trouvé';
        this.isLoading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'bg-amber-500/30 text-amber-200 border border-amber-500/50',
      'VALIDE_SEC': 'bg-sky-500/30 text-sky-200 border border-sky-500/50',
      'REJETE_SEC': 'bg-red-500/30 text-red-200 border border-red-500/50',
      'DRH_EN_ATTENTE': 'bg-purple-500/30 text-purple-200 border border-purple-500/50',
      'VALIDE_DRH': 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50',
      'REJETE_DRH': 'bg-red-500/30 text-red-200 border border-red-500/50'
    };
    return classes[statut] || 'bg-gray-500/30 text-gray-200';
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

  getStatutLabel(statut: string): string {
    const labels: any = {
      'EN_ATTENTE': 'En attente',
      'VALIDE_SEC': 'Validé par secrétariat',
      'REJETE_SEC': 'Rejeté',
      'DRH_EN_ATTENTE': 'En cours DRH',
      'VALIDE_DRH': 'Accepté !',
      'REJETE_DRH': 'Non retenu'
    };
    return labels[statut] || statut;
  }

  getStatutMessage(statut: string): string {
    const messages: any = {
      'EN_ATTENTE': 'Votre dossier est en cours d\'examen par notre secrétariat. Vous serez informé par email.',
      'VALIDE_SEC': 'Félicitations ! Votre dossier a été validé et transmis à la DRH pour validation finale.',
      'REJETE_SEC': 'Nous vous remercions de votre intérêt. Votre dossier n\'a pas été retenu pour cette session.',
      'DRH_EN_ATTENTE': 'Votre dossier est actuellement à l\'étude par la Direction des Ressources Humaines.',
      'VALIDE_DRH': '🎉 Félicitations ! Votre candidature est acceptée. Vous serez contacté prochainement.',
      'REJETE_DRH': 'Nous vous remercions de votre candidature. Après étude, nous ne pouvons pas donner suite.'
    };
    return messages[statut] || 'En attente de traitement.';
  }

  getProgression(statut: string): number {
    const progress: any = {
      'EN_ATTENTE': 25,
      'VALIDE_SEC': 50,
      'DRH_EN_ATTENTE': 75,
      'VALIDE_DRH': 100,
      'REJETE_SEC': 100,
      'REJETE_DRH': 100
    };
    return progress[statut] || 0;
  }

  reset() {
    this.numeroDossier = '';
    this.candidature = null;
    this.rechercheEffectuee = false;
    this.errorMessage = '';
  }
}