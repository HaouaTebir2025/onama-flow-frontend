import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './liste.html',
  styleUrls: ['./liste.scss']
})
export class ListeComponent implements OnInit {
  stagiaires: any[] = [];
  searchTerm = '';
  filtreStatut = 'TOUS';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  // Modal modification
  showEditModal = false;
  stagiaireEdit: any = {};

  // Modal confirmation suppression
  showDeleteModal = false;
  stagiaireDelete: any = null;

  // Modal détails
  showDetailsModal = false;
  stagiaireDetails: any = null;

  stats = { 
    total: 0, 
    depot: 0, 
    valide: 0, 
    programme: 0, 
    termine: 0,
    academique: 0,
    perfectionnement: 0
  };

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.chargerStagiaires();
  }

  chargerStagiaires() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/stagiaires`, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data;
        this.calculerStatistiques();
        this.isLoading = false;
      },
      error: () => { 
        this.message = '❌ Erreur de chargement';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  calculerStatistiques() {
    this.stats.total = this.stagiaires.length;
    this.stats.depot = this.stagiaires.filter(s => s.statut === 'DEPOT').length;
    this.stats.valide = this.stagiaires.filter(s => s.statut === 'VALIDE').length;
    this.stats.programme = this.stagiaires.filter(s => s.statut === 'PROGRAMME').length;
    this.stats.termine = this.stagiaires.filter(s => s.statut === 'TERMINE').length;
    this.stats.academique = this.stagiaires.filter(s => s.type === 'ACADEMIQUE').length;
    this.stats.perfectionnement = this.stagiaires.filter(s => s.type === 'PERFECTIONNEMENT').length;
  }

  rafraichir() {
    this.chargerStagiaires();
  }

  get stagiairesFiltres() {
    let result = this.stagiaires;
    if (this.searchTerm) {
      result = result.filter(s => 
        s.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.universite && s.universite.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    if (this.filtreStatut !== 'TOUS') {
      result = result.filter(s => s.statut === this.filtreStatut);
    }
    return result;
  }

  // ============================================
  // VOIR DÉTAILS - MODAL
  // ============================================
  ouvrirDetails(s: any) {
    this.stagiaireDetails = s;
    this.showDetailsModal = true;
  }

  fermerDetails() {
    this.showDetailsModal = false;
    this.stagiaireDetails = null;
  }

  // ============================================
  // MODIFIER - MODAL
  // ============================================
  ouvrirModalModifier(s: any) {
    this.stagiaireEdit = { ...s };
    this.showEditModal = true;
  }

  fermerModal() {
    this.showEditModal = false;
    this.stagiaireEdit = {};
  }

  enregistrerModification() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.patch(`${this.apiUrl}/stagiaires/${this.stagiaireEdit.id}`, this.stagiaireEdit, { headers }).subscribe({
      next: () => {
        this.message = `✅ Stagiaire "${this.stagiaireEdit.nom} ${this.stagiaireEdit.prenom}" modifié avec succès`;
        this.messageType = 'success';
        this.fermerModal();
        this.chargerStagiaires();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = '❌ Erreur lors de la modification';
        this.messageType = 'error';
      }
    });
  }

  // ============================================
  // SUPPRIMER - MODAL DE CONFIRMATION
  // ============================================
  ouvrirConfirmationSuppression(s: any) {
    this.stagiaireDelete = s;
    this.showDeleteModal = true;
  }

  fermerConfirmationSuppression() {
    this.showDeleteModal = false;
    this.stagiaireDelete = null;
  }

  confirmerSuppression() {
    if (!this.stagiaireDelete) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.delete(`${this.apiUrl}/stagiaires/${this.stagiaireDelete.id}`, { headers }).subscribe({
      next: () => {
        this.message = `✅ Stagiaire "${this.stagiaireDelete.nom} ${this.stagiaireDelete.prenom}" supprimé avec succès`;
        this.messageType = 'success';
        this.fermerConfirmationSuppression();
        this.chargerStagiaires();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = '❌ Erreur lors de la suppression';
        this.messageType = 'error';
        this.fermerConfirmationSuppression();
      }
    });
  }

  exporterCSV() {
    const data = this.stagiairesFiltres.map(s => ({
      'ID': s.id,
      'Nom': s.nom,
      'Prénom': s.prenom,
      'Email': s.email || '',
      'Téléphone': s.telephone || '',
      'Université': s.universite || '',
      'Type': s.type === 'ACADEMIQUE' ? 'Académique' : 'Perfectionnement',
      'Statut': s.statut,
      'Date dépôt': s.dateDepot || ''
    }));
    
    const csv = this.convertToCSV(data);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `stagiaires_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.message = '✅ Export CSV réussi';
    this.messageType = 'success';
    setTimeout(() => this.message = '', 3000);
  }

  convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => {
      const value = obj[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }
}