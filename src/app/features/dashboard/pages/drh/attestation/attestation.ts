import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-attestation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attestation.html',
  styleUrls: ['./attestation.scss']
})
export class AttestationComponent implements OnInit {
  stagiaires: any[] = [];
  searchTerm = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showModal = false;
  stagiaireSelectionne: any = null;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() { 
    this.chargerStagiaires(); 
  }

  chargerStagiaires() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/stagiaires?role=DRH`, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data.filter((s: any) => s.statut === 'TERMINE'); 
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

  rafraichir() {
    this.chargerStagiaires();
  }

  get stagiairesFiltres() {
    return this.stagiaires.filter(s => 
      s.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      s.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.universite && s.universite.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  ouvrirAttestation(s: any) { 
    this.stagiaireSelectionne = s; 
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

  getDirectionName(directionId: string): string {
    const directions: any = {
      'TV': 'Télévision Nationale',
      'RADIO': 'Radiodiffusion Nationale',
      'COM': 'Communication Nationale'
    };
    return directions[directionId] || directionId;
  }

  genererAttestation() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    this.http.post(`${this.apiUrl}/attestation/${this.stagiaireSelectionne.id}`, {}, { 
      headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation_${this.stagiaireSelectionne.nom}_${this.stagiaireSelectionne.prenom}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.message = `✅ Attestation générée pour ${this.stagiaireSelectionne.nom} ${this.stagiaireSelectionne.prenom}`;
        this.messageType = 'success';
        this.showModal = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message = '❌ Erreur lors de la génération';
        this.messageType = 'error';
      }
    });
  }

  getInitiales(nom: string, prenom: string): string { 
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || ''); 
  }
}