import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-suivi',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './suivi.html',        // ← CORRIGÉ : suivi.html au lieu de dashboard.html
  styleUrls: ['./suivi.scss']
})
export class SuiviComponent implements OnInit {
  dossier: any = null;
  isLoading = true;
  user: any;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  ngOnInit() {
    this.chargerDossier();
  }

  chargerDossier() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/mon-dossier`, { headers }).subscribe({
      next: (data: any) => {
        this.dossier = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    switch(statut) {
      case 'DEPOT': return 'bg-yellow-100 text-yellow-800';
      case 'VALIDE': return 'bg-green-100 text-green-800';
      case 'PROGRAMME': return 'bg-blue-100 text-blue-800';
      case 'TERMINE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'DEPOT': return '⏳';
      case 'VALIDE': return '✅';
      case 'PROGRAMME': return '📅';
      case 'TERMINE': return '🎓';
      default: return '❓';
    }
  }

  getStatutMessage(statut: string): string {
    switch(statut) {
      case 'DEPOT': return 'Votre dossier a été reçu. Le secrétariat va le vérifier sous 48h.';
      case 'VALIDE': return 'Votre dossier a été validé ! Vous allez être orienté vers une direction.';
      case 'PROGRAMME': return 'Votre stage a été planifié ! Consultez les détails ci-dessous.';
      case 'TERMINE': return 'Félicitations ! Votre stage est terminé. Votre attestation est disponible.';
      default: return 'En attente de traitement.';
    }
  }

  getEtapeProgress(statut: string): number {
    switch(statut) {
      case 'DEPOT': return 25;
      case 'VALIDE': return 50;
      case 'PROGRAMME': return 75;
      case 'TERMINE': return 100;
      default: return 0;
    }
  }

  genererAttestation() {
    if (!this.dossier || this.dossier.statut !== 'TERMINE') return;
    
    const token = localStorage.getItem('token');
    window.open(`${this.apiUrl}/attestation/${this.dossier.id}?token=${token}`, '_blank');
  }
}