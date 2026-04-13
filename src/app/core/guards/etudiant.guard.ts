import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EtudiantGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Si pas connecté → rediriger vers la page de connexion
    if (!token || !user) {
      this.router.navigate(['/connexion-etudiant']);
      return false;
    }
    
    const userData = JSON.parse(user);
    
    // Si ce n'est pas un étudiant → déconnecter et rediriger vers connexion
    if (userData.role !== 'ETUDIANT') {
      localStorage.clear();
      this.router.navigate(['/connexion-etudiant']);
      return false;
    }
    
    // Étudiant connecté → accès autorisé
    return true;
  }
}