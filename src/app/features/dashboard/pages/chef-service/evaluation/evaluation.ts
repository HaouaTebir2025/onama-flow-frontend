import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.scss']
})
export class EvaluationComponent implements OnInit {
  stagiaires: any[] = [];
  searchTerm = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showModal = false;
  stagiaireSelectionne: any = null;
  evaluationForm = { note: 0, rapport: '' };

  stats = { aEvaluer: 0, evalues: 0, total: 0 };

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() { 
    this.chargerStagiaires(); 
  }

  chargerStagiaires() {
    this.isLoading = true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    const url = `${this.apiUrl}/stagiaires?role=CHEF_SERVICE&direction=${user.directionAccess}&service=${encodeURIComponent(user.service)}`;
    
    this.http.get(url, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data;
        this.calculerStatistiques();
        this.isLoading = false;
      },
      error: (err) => { 
        console.error('Erreur:', err);
        this.message = '❌ Erreur de chargement'; 
        this.messageType = 'error'; 
        this.isLoading = false;
      }
    });
  }

  calculerStatistiques() {
    this.stats.aEvaluer = this.stagiaires.filter(s => s.statut === 'PROGRAMME').length;
    this.stats.evalues = this.stagiaires.filter(s => s.statut === 'TERMINE').length;
    this.stats.total = this.stagiaires.length;
  }

  rafraichir() {
    this.chargerStagiaires();
  }

  get stagiairesFiltres() {
    return this.stagiaires.filter(s => 
      s.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      s.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.service && s.service.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  ouvrirEvaluation(s: any) { 
    this.stagiaireSelectionne = s; 
    this.evaluationForm = { note: s.note || 0, rapport: s.rapport || '' }; 
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false;
  }

  getMention(note: number): string {
    if (note >= 18) return 'Excellent';
    if (note >= 16) return 'Très bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  validerEvaluation() {
    if (!this.evaluationForm.note || this.evaluationForm.note < 0 || this.evaluationForm.note > 20) {
      this.message = '❌ Note invalide (0-20)';
      this.messageType = 'error';
      return;
    }
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    });
    
    this.http.patch(`${this.apiUrl}/stagiaires/${this.stagiaireSelectionne.id}`, 
      { 
        note: this.evaluationForm.note, 
        rapport: this.evaluationForm.rapport, 
        statut: 'TERMINE' 
      }, 
      { headers }
    ).subscribe({
      next: () => { 
        this.message = `✅ ${this.stagiaireSelectionne.nom} ${this.stagiaireSelectionne.prenom} évalué (${this.evaluationForm.note}/20)`; 
        this.messageType = 'success'; 
        this.showModal = false; 
        this.chargerStagiaires(); 
        setTimeout(() => this.message = '', 3000); 
      },
      error: (err) => { 
        console.error('Erreur:', err);
        this.message = '❌ Erreur lors de l\'évaluation'; 
        this.messageType = 'error'; 
      }
    });
  }

  getProgression(dateDebut: string, dateFin: string): number {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const aujourdhui = new Date();
    if (aujourdhui < debut) return 0;
    if (aujourdhui > fin) return 100;
    const total = fin.getTime() - debut.getTime();
    const ecoule = aujourdhui.getTime() - debut.getTime();
    return Math.round((ecoule / total) * 100);
  }

  getInitiales(nom: string, prenom: string): string { 
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || ''); 
  }
}