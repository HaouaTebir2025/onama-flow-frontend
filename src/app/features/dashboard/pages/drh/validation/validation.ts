import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './validation.html',
  styleUrls: ['./validation.scss']
})
export class ValidationComponent implements OnInit {
  stagiaires: any[] = [];
  searchTerm = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | 'info' | '' = '';
  
  // Modale
  showModal = false;
  selectedStagiaire: any = null;
  modalAction: 'valider' | 'rejeter' = 'valider';
  modalCommentaire = '';
  modalLoading = false;

  stats = { enAttente: 0, aujourdhui: 0 };

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.chargerStagiaires();
  }

  chargerStagiaires() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.showNotification('Session expirée, veuillez vous reconnecter', 'error');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/stagiaires?role=DRH`, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data.filter((s: any) => s.statut === 'DEPOT');
        this.stats.enAttente = this.stagiaires.length;
        this.stats.aujourdhui = this.stagiaires.filter((s: any) => s.dateDepot === new Date().toISOString().split('T')[0]).length;
        this.isLoading = false;
      },
      error: (err) => { 
        console.error('Erreur:', err);
        this.showNotification('Erreur de chargement des dossiers', 'error');
        this.isLoading = false;
      }
    });
  }

  rafraichir() {
    this.showNotification('Actualisation en cours...', 'info');
    this.chargerStagiaires();
  }

  get stagiairesFiltres() {
    return this.stagiaires.filter(s => 
      s.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      s.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.universite && s.universite.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  // Ouvrir la modale de validation
  ouvrirValidation(stagiaire: any) {
    this.selectedStagiaire = stagiaire;
    this.modalAction = 'valider';
    this.modalCommentaire = '';
    this.showModal = true;
  }

  // Ouvrir la modale de rejet
  ouvrirRejet(stagiaire: any) {
    this.selectedStagiaire = stagiaire;
    this.modalAction = 'rejeter';
    this.modalCommentaire = '';
    this.showModal = true;
  }

  // Fermer la modale
  fermerModal() {
    this.showModal = false;
    this.selectedStagiaire = null;
    this.modalCommentaire = '';
    this.modalLoading = false;
  }

  // Confirmer l'action
  confirmerAction() {
    if (!this.selectedStagiaire) return;
    
    this.modalLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    if (this.modalAction === 'valider') {
      // Validation du dossier
      this.http.patch(`${this.apiUrl}/stagiaires/${this.selectedStagiaire.id}`, 
        { statut: 'VALIDE', commentaire: this.modalCommentaire }, 
        { headers }
      ).subscribe({
        next: () => { 
          this.showNotification(`✅ Dossier de ${this.selectedStagiaire.nom} ${this.selectedStagiaire.prenom} validé avec succès`, 'success');
          this.fermerModal();
          this.chargerStagiaires();
        },
        error: (err) => { 
          console.error('Erreur:', err);
          this.showNotification('❌ Erreur lors de la validation du dossier', 'error');
          this.modalLoading = false;
        }
      });
    } else {
      // Rejet du dossier
      this.http.patch(`${this.apiUrl}/stagiaires/${this.selectedStagiaire.id}`,
        { statut: 'REJETE', commentaire: this.modalCommentaire },
        { headers }
      ).subscribe({
        next: () => { 
          this.showNotification(`❌ Dossier de ${this.selectedStagiaire.nom} ${this.selectedStagiaire.prenom} rejeté`, 'error');
          this.fermerModal();
          this.chargerStagiaires();
        },
        error: (err) => { 
          console.error('Erreur:', err);
          this.showNotification('❌ Erreur lors du rejet du dossier', 'error');
          this.modalLoading = false;
        }
      });
    }
  }

  // Afficher une notification
  showNotification(msg: string, type: 'success' | 'error' | 'info') {
    this.message = msg;
    this.messageType = type;
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  getInitiales(nom: string, prenom: string): string { 
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || ''); 
  }

  formatDate(date: string): string {
    if (!date) return 'Non définie';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}