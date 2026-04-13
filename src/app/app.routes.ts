import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { EtudiantGuard } from './core/guards/etudiant.guard';

export const routes: Routes = [
  // ============================================
  // PAGE DE BIENVENUE (LANDING) - accessible sans authentification
  // ============================================
  { path: '', loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent) },
  
  // ============================================
  // AUTHENTIFICATION - accessibles sans authentification
  // ============================================
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  { path: 'inscription', loadComponent: () => import('./features/auth/inscription/inscription').then(m => m.InscriptionComponent) },
  
  // ============================================
  // ESPACE ÉTUDIANT
  // ============================================
  // Connexion spécifique étudiant
  { path: 'connexion-etudiant', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  
  // Routes protégées pour étudiants
  {
    path: 'etudiant',
    canActivate: [EtudiantGuard],
    children: [
      { path: 'depot', loadComponent: () => import('./features/etudiant/depot/depot-candidature').then(m => m.DepotCandidatureComponent) },
      { path: 'confirmation', loadComponent: () => import('./features/etudiant/confirmation/confirmation').then(m => m.ConfirmationComponent) },
      { path: 'suivi', loadComponent: () => import('./features/etudiant/suivi/suivi-candidature').then(m => m.SuiviCandidatureComponent) },
      { path: '', redirectTo: 'depot', pathMatch: 'full' }
    ]
  },
  
  // ============================================
  // SUIVI PUBLIC - accessible sans authentification
  // ============================================
  { path: 'suivi-public', loadComponent: () => import('./features/public/suivi/suivi-public').then(m => m.SuiviPublicComponent) },
  
  // ============================================
  // DÉPÔT DE LETTRE - redirection vers espace étudiant
  // ============================================
  { path: 'depot-lettre', redirectTo: '/etudiant/depot', pathMatch: 'full' },
  
  // ============================================
  // DASHBOARD PRINCIPAL (protégé pour gestionnaires)
  // ============================================
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      
      // ============================================
      // ACCUEIL - Tableau de bord
      // ============================================
      { 
        path: 'accueil', 
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/pages/accueil/accueil').then(m => m.AccueilComponent) 
      },
      
      // ============================================
      // PROFIL - accessible à tous les utilisateurs connectés
      // ============================================
      { 
        path: 'profil', 
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/pages/profil/profil').then(m => m.ProfilComponent) 
      },
      
      // ============================================
      // SECRÉTARIAT - Candidatures en attente (NOUVEAU)
      // ============================================
      { 
        path: 'secretariat/candidatures', 
        canActivate: [() => roleGuard(['SECRETARIAT', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/secretariat/candidatures/liste-candidatures').then(m => m.ListeCandidaturesComponent) 
      },
      
      // ============================================
      // SECRÉTARIAT - Liste des dossiers (existant)
      // ============================================
      { 
        path: 'secretariat/liste', 
        canActivate: [() => roleGuard(['SECRETARIAT', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/secretariat/liste/liste').then(m => m.ListeComponent) 
      },
      
      // ============================================
      // SECRÉTARIAT - Nouveau dossier
      // ============================================
      { 
        path: 'secretariat/nouveau-dossier', 
        canActivate: [() => roleGuard(['SECRETARIAT', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/secretariat/nouveau-dossier/nouveau-dossier').then(m => m.NouveauDossierComponent) 
      },
      
      // ============================================
      // SECRÉTARIAT - Gestion des lettres
      // ============================================
      { 
        path: 'secretariat/lettres', 
        canActivate: [() => roleGuard(['SECRETARIAT', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/secretariat/lettres/lettres').then(m => m.LettresComponent) 
      },
      
      // ============================================
      // DRH - Candidatures à traiter (NOUVEAU)
      // ============================================
      { 
        path: 'drh/candidatures', 
        canActivate: [() => roleGuard(['DRH', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/drh/candidatures-drh/liste-candidatures-drh').then(m => m.ListeCandidaturesDRHComponent) 
      },
      
      // ============================================
      // DRH - Validation
      // ============================================
      { 
        path: 'drh/validation', 
        canActivate: [() => roleGuard(['DRH', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/drh/validation/validation').then(m => m.ValidationComponent) 
      },
      
      // ============================================
      // DRH - Orientation
      // ============================================
      { 
        path: 'drh/orientation', 
        canActivate: [() => roleGuard(['DRH', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/drh/orientation/orientation').then(m => m.OrientationComponent) 
      },
      
      // ============================================
      // DRH - Attestation
      // ============================================
      { 
        path: 'drh/attestation', 
        canActivate: [() => roleGuard(['DRH', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/drh/attestation/attestation').then(m => m.AttestationComponent) 
      },
      
      // ============================================
      // DIRECTION - Planning
      // ============================================
      { 
        path: 'direction/planning', 
        canActivate: [() => roleGuard(['DIRECTEUR', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/direction/planning/planning').then(m => m.PlanningComponent) 
      },
      
      // ============================================
      // CHEF DE SERVICE - Évaluation
      // ============================================
      { 
        path: 'chef-service/evaluation', 
        canActivate: [() => roleGuard(['CHEF_SERVICE', 'ADMIN'])],
        loadComponent: () => import('./features/dashboard/pages/chef-service/evaluation/evaluation').then(m => m.EvaluationComponent) 
      },
    ]
  },
  
  // ============================================
  // REDIRECTION PAR DÉFAUT (page non trouvée)
  // ============================================
  { path: '**', redirectTo: '' }
];