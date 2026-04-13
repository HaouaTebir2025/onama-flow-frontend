export interface Candidature {
  id: number;
  userId: number;
  numeroDossier: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  universite: string;
  filiere?: string;
  anneeEtude?: string;
  periodeSouhaitee: string;
  cvPath: string;
  cvNom: string;
  lettrePath: string;
  lettreNom: string;
  statutCandidature: 'EN_ATTENTE' | 'VALIDE_SEC' | 'REJETE_SEC' | 'DRH_EN_ATTENTE' | 'VALIDE_DRH' | 'REJETE_DRH';
  commentaireSecretariat?: string;
  commentaireDRH?: string;
  dateDepot: string;
  dateTraitementSecretariat?: string;
  dateTraitementDRH?: string;
  stagiaireId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CandidatureWithUrls extends Candidature {
  cvUrl?: string;
  lettreUrl?: string;
  statutInfo?: {
    label: string;
    color: string;
    message: string;
  };
}