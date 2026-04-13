import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ONAMA_ORG, getDirectionName } from '../../../../../core/onama-org';

@Component({
  selector: 'app-orientation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orientation.html',
  styleUrls: ['./orientation.scss']
})
export class OrientationComponent implements OnInit {
  stagiaires: any[] = [];
  directions = ONAMA_ORG.directions;
  searchTerm = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showModal = false;
  stagiaireSelectionne: any = null;
  directionSelectionnee: string = '';

  stats = { total: 0, aOrienter: 0 };

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() { 
    this.chargerStagiaires(); 
  }

  get directionsList() { 
    return this.directions.map(d => ({ id: d.id, nom: d.nom })); 
  }

  chargerStagiaires() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/stagiaires?role=DRH`, { headers }).subscribe({
      next: (data: any) => { 
        this.stagiaires = data.filter((s: any) => s.statut === 'VALIDE' && !s.direction);
        this.stats.total = this.stagiaires.length;
        this.stats.aOrienter = this.stagiaires.length;
        this.isLoading = false;
      },
      error: () => { 
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
      s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      s.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.universite && s.universite.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  ouvrirOrientation(s: any) { 
    this.stagiaireSelectionne = s; 
    this.directionSelectionnee = ''; 
    this.showModal = true; 
  }

  orienter() {
    if (!this.directionSelectionnee) { 
      this.message = '❌ Choisissez une direction'; 
      this.messageType = 'error'; 
      return; 
    }
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    });
    
    this.http.patch(`${this.apiUrl}/stagiaires/${this.stagiaireSelectionne.id}`, 
      { direction: this.directionSelectionnee, statut: 'VALIDE' }, 
      { headers }
    ).subscribe({
      next: () => { 
        this.message = `✅ Stagiaire orienté vers ${getDirectionName(this.directionSelectionnee)}`; 
        this.messageType = 'success'; 
        this.showModal = false; 
        this.chargerStagiaires(); 
        setTimeout(() => this.message = '', 3000); 
      },
      error: () => { 
        this.message = '❌ Erreur lors de l\'orientation'; 
        this.messageType = 'error'; 
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.stagiaireSelectionne = null;
  }

  getInitiales(nom: string, prenom: string): string { 
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || ''); 
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'DEPOT': 'bg-yellow-100 text-yellow-800',
      'VALIDE': 'bg-green-100 text-green-800',
      'PROGRAMME': 'bg-blue-100 text-blue-800',
      'TERMINE': 'bg-gray-100 text-gray-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }
}