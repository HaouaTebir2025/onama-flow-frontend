import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stagiaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class StagiaireDashboardComponent implements OnInit {
  user: any;
  dossier: any = null;
  isLoading = true;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  ngOnInit() {
    this.chargerMonDossier();
  }

  chargerMonDossier() {
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
      case 'DEPOT': return 'Votre dossier a été reçu. Le secrétariat va le vérifier.';
      case 'VALIDE': return 'Votre dossier a été validé ! Vous allez être orienté.';
      case 'PROGRAMME': return 'Votre stage a été planifié ! Consultez les détails ci-dessous.';
      case 'TERMINE': return 'Félicitations ! Votre stage est terminé. Votre attestation est disponible.';
      default: return 'En attente de traitement.';
    }
  }
}