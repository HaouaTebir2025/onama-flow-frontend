import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ONAMA_ORG, getSousDirections, getAllServices, getServicesBySousDirection, getDirectionName, getChefsByService } from '../../../../../core/onama-org';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.scss']
})
export class PlanningComponent implements OnInit {
  stagiaires: any[] = [];
  directions = ONAMA_ORG.directions;
  directionId: string = '';
  searchTerm = '';
  filtreStatut = 'TOUS';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  stats = { total: 0, aPlanifier: 0, programmes: 0, services: 0 };
  
  showModal = false;
  showViewModal = false;
  stagiaireSelectionne: any = null;
  mode: 'create' | 'edit' = 'create';
  planningForm: any = { 
    service: '', 
    sousDirection: '', 
    chefService: '', 
    dateDebut: '', 
    dateFin: '', 
    duree: 2, 
    rotation: ['', '', '', '', '', '', '', ''] 
  };
  viewPlanning: any = null;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.directionId = user.directionAccess;
  }

  ngOnInit() { 
    this.chargerStagiaires(); 
  }

  get directionNom(): string { 
    return getDirectionName(this.directionId); 
  }

  get sousDirections() { 
    return getSousDirections(this.directionId); 
  }

  getServicesDispo() {
    if (this.planningForm.sousDirection) {
      return getServicesBySousDirection(this.directionId, this.planningForm.sousDirection);
    }
    return getAllServices(this.directionId);
  }

  getChefsDispo() { 
    return getChefsByService(this.planningForm.service); 
  }

  rafraichir() { this.chargerStagiaires(); }
  filtrerParStatut() {}

  chargerStagiaires() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${this.apiUrl}/stagiaires/direction?direction=${this.directionId}`;
    
    this.http.get(url, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data; 
        this.calculerStats();
        this.isLoading = false;
      },
      error: () => { 
        this.message = '❌ Erreur de chargement'; 
        this.messageType = 'error'; 
        this.isLoading = false;
      }
    });
  }

  calculerStats() {
    this.stats.total = this.stagiaires.length;
    this.stats.aPlanifier = this.stagiaires.filter((s: any) => s.statut === 'VALIDE').length;
    this.stats.programmes = this.stagiaires.filter((s: any) => s.statut === 'PROGRAMME').length;
    this.stats.services = this.getServicesDispo().length;
  }

  get stagiairesFiltres() {
    let result = this.stagiaires;
    if (this.searchTerm) {
      result = result.filter(s => 
        s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.prenom.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.filtreStatut !== 'TOUS') {
      result = result.filter(s => s.statut === this.filtreStatut);
    }
    return result;
  }

  ouvrirPlanning(s: any) {
    this.mode = 'create';
    this.stagiaireSelectionne = s;
    this.planningForm = {
      service: s.service || '',
      sousDirection: s.sousDirection || '',
      chefService: s.chefService || '',
      dateDebut: s.dateDebut || '',
      dateFin: s.dateFin || '',
      duree: s.duree || 2,
      rotation: s.rotation || ['', '', '', '', '', '', '', '']
    };
    this.showModal = true;
  }

  modifierPlanning(s: any) {
    this.mode = 'edit';
    this.stagiaireSelectionne = s;
    this.planningForm = {
      service: s.service || '',
      sousDirection: s.sousDirection || '',
      chefService: s.chefService || '',
      dateDebut: s.dateDebut || '',
      dateFin: s.dateFin || '',
      duree: s.duree || 2,
      rotation: s.rotation || ['', '', '', '', '', '', '', '']
    };
    this.showModal = true;
  }

  supprimerPlanning(s: any) {
    if (confirm(`Supprimer le planning de ${s.nom} ${s.prenom} ?`)) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
      const updateData = { service: '', sousDirection: '', chefService: '', dateDebut: '', dateFin: '', rotation: [], statut: 'VALIDE' };
      this.http.patch(`${this.apiUrl}/stagiaires/${s.id}`, updateData, { headers }).subscribe({
        next: () => { this.message = '✅ Planning annulé'; this.messageType = 'success'; this.chargerStagiaires(); setTimeout(() => this.message = '', 3000); },
        error: () => { this.message = '❌ Erreur'; this.messageType = 'error'; }
      });
    }
  }

  voirPlanning(s: any) {
    this.viewPlanning = { stagiaire: s, service: s.service, dateDebut: s.dateDebut, dateFin: s.dateFin, rotation: s.rotation || Array(8).fill(s.service) };
    this.showViewModal = true;
  }

  calculerDateFin() {
    if (this.planningForm.dateDebut && this.planningForm.duree) {
      const date = new Date(this.planningForm.dateDebut);
      date.setMonth(date.getMonth() + this.planningForm.duree);
      this.planningForm.dateFin = date.toISOString().split('T')[0];
    }
  }

  onSousDirectionChange() { this.planningForm.service = ''; }

  validerPlanning() {
    if (!this.stagiaireSelectionne || !this.planningForm.service) {
      this.message = '❌ Veuillez choisir un service';
      this.messageType = 'error';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
    const updateData = {
      service: this.planningForm.service,
      sousDirection: this.planningForm.sousDirection,
      chefService: this.planningForm.chefService,
      dateDebut: this.planningForm.dateDebut,
      dateFin: this.planningForm.dateFin,
      rotation: this.planningForm.rotation,
      statut: 'PROGRAMME'
    };

    this.http.patch(`${this.apiUrl}/stagiaires/${this.stagiaireSelectionne.id}`, updateData, { headers }).subscribe({
      next: () => {
        this.message = '✅ Planning enregistré';
        this.messageType = 'success';
        this.showModal = false;
        this.chargerStagiaires();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => { this.message = '❌ Erreur'; this.messageType = 'error'; }
    });
  }

  closeModal() { this.showModal = false; this.showViewModal = false; }
  imprimerPlanningStagiaire(s: any) { this.voirPlanning(s); setTimeout(() => window.print(), 500); }
  getProgression(dateDebut: string, dateFin: string): number { return 0; }
  getInitiales(nom: string, prenom: string): string { return (nom?.charAt(0) || '') + (prenom?.charAt(0) || ''); }
}