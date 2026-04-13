import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lettres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lettres.html',
  styleUrls: ['./lettres.scss']
})
export class LettresComponent implements OnInit {
  lettres: any[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showModal = false;
  selectedLettre: any = null;

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.chargerLettres();
  }

  chargerLettres() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/lettres-en-attente`, { headers }).subscribe({
      next: (data: any) => {
        this.lettres = data;
        this.isLoading = false;
      },
      error: () => {
        this.message = '❌ Erreur de chargement';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  telechargerLettre(id: number) {
    const token = localStorage.getItem('token');
    window.open(`${this.apiUrl}/telecharger-lettre/${id}?token=${token}`, '_blank');
  }

  ouvrirModal(lettre: any) {
    this.selectedLettre = lettre;
    this.showModal = true;
  }

  validerLettre(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.post(`${this.apiUrl}/valider-lettre/${id}`, {}, { headers }).subscribe({
      next: () => {
        this.message = '✅ Lettre validée, dossier transmis à la DRH';
        this.messageType = 'success';
        this.chargerLettres();
        this.closeModal();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = '❌ Erreur lors de la validation';
        this.messageType = 'error';
      }
    });
  }

  rejeterLettre(id: number) {
    const commentaire = prompt('Motif du rejet (optionnel):');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.post(`${this.apiUrl}/rejeter-lettre/${id}`, { commentaire }, { headers }).subscribe({
      next: () => {
        this.message = '❌ Lettre rejetée';
        this.messageType = 'error';
        this.chargerLettres();
        this.closeModal();
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = '❌ Erreur lors du rejet';
        this.messageType = 'error';
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedLettre = null;
  }
}