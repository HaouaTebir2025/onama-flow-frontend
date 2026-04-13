import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://web-production-2de2.up.railway.app/api';

  constructor(private http: HttpClient) {}

  // Auth
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // Candidature étudiant
  deposerCandidature(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/deposer-candidature`, formData);
  }

  getMaCandidature(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ma-candidature`);
  }

  suiviCandidature(numeroDossier: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/suivi-candidature/${numeroDossier}`);
  }

  // Secrétariat
  getCandidaturesEnAttente(): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidatures-en-attente`);
  }

  validerCandidature(id: number, commentaire?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/valider-candidature/${id}`, { commentaire });
  }

  rejeterCandidature(id: number, commentaire: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rejeter-candidature/${id}`, { commentaire });
  }

  telechargerDocument(id: number, type: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger-document/${id}/${type}`, {
      responseType: 'blob'
    });
  }

  // DRH
  getCandidaturesDRH(): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidatures-drh`);
  }

  validerCandidatureDRH(id: number, commentaire?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/valider-candidature-drh/${id}`, { commentaire });
  }

  rejeterCandidatureDRH(id: number, commentaire: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rejeter-candidature-drh/${id}`, { commentaire });
  }
}