export interface Stagiaire {
  id: number;
  userId?: number;
  numeroDossier?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  universite: string;
  filiere?: string;
  anneeEtude?: string;
  
  // Candidature
  periodeSouhaitee?: string;
  cvPath?: string;
  cvNom?: string;
  lettrePath?: string;
  lettreNom?: string;
  statutCandidature?: string;
  commentaireSecretariat?: string;
  commentaireDRH?: string;
  dateDepot?: string;
  
  // Stage
  type: string;
  direction: string;
  service: string;
  sousDirection?: string;
  chefService?: string;
  dateDebut?: string;
  dateFin?: string;
  duree: number;
  rotation?: any[];
  note: number;
  rapport?: string;
  rapportDepose: boolean;
  statut: 'DEPOT' | 'VALIDE' | 'PROGRAMME' | 'TERMINE';
  dateOrientation?: string;
  dateEvaluation?: string;
  
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StagiaireStats {
  total: number;
  parDirection: Record<string, number>;
  parStatut: Record<string, number>;
}