export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password?: string;
  role: 'ADMIN' | 'SECRETARIAT' | 'DRH' | 'DIRECTEUR' | 'CHEF_SERVICE' | 'ETUDIANT';
  universite?: string;
  directionAccess?: string;
  service?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}