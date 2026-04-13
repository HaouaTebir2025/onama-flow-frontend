// ============================================
// ORGANIGRAMME ONAMA FLOW
// Basé sur la structure du backend
// ============================================

export interface Direction {
  id: string;
  nom: string;
  code: string;
  sousDirections: SousDirection[];
}

export interface SousDirection {
  id: string;
  nom: string;
  code: string;
  services: Service[];
}

export interface Service {
  id: string;
  nom: string;
  code: string;
  chef?: Chef;
}

export interface Chef {
  id: string;
  nom: string;
  prenom?: string;
  email?: string;
  serviceId: string;
}

// ============================================
// ORGANIGRAMME COMPLET
// ============================================

export const ONAMA_ORG = {
  // Directions principales
  directions: [
    { 
      id: 'TV', 
      nom: 'Télévision Nationale', 
      code: 'TV',
      sousDirections: [
        {
          id: 'SD_TV_1',
          nom: 'Production Télévision',
          code: 'PROD_TV',
          services: [
            { id: 'SERV_TV_1', nom: 'Production Magazine', code: 'MAG' },
            { id: 'SERV_TV_2', nom: 'Production Journal', code: 'JRN' },
            { id: 'SERV_TV_3', nom: 'Production Divertissement', code: 'DIV' }
          ]
        },
        {
          id: 'SD_TV_2',
          nom: 'Technique Télévision',
          code: 'TECH_TV',
          services: [
            { id: 'SERV_TV_4', nom: 'Régie', code: 'REG' },
            { id: 'SERV_TV_5', nom: 'Montage', code: 'MTG' },
            { id: 'SERV_TV_6', nom: 'Caméra', code: 'CAM' }
          ]
        },
        {
          id: 'SD_TV_3',
          nom: 'Rédaction Télévision',
          code: 'RED_TV',
          services: [
            { id: 'SERV_TV_7', nom: 'Rédaction Chef', code: 'RCH' },
            { id: 'SERV_TV_8', nom: 'Journalistes', code: 'JRN' },
            { id: 'SERV_TV_9', nom: 'Reporters', code: 'REP' }
          ]
        }
      ]
    },
    { 
      id: 'RADIO', 
      nom: 'Radiodiffusion Nationale', 
      code: 'RADIO',
      sousDirections: [
        {
          id: 'SD_RADIO_1',
          nom: 'Production Radio',
          code: 'PROD_RADIO',
          services: [
            { id: 'SERV_RADIO_1', nom: 'Production Émissions', code: 'EMI' },
            { id: 'SERV_RADIO_2', nom: 'Production Journal', code: 'JRN' }
          ]
        },
        {
          id: 'SD_RADIO_2',
          nom: 'Technique Radio',
          code: 'TECH_RADIO',
          services: [
            { id: 'SERV_RADIO_3', nom: 'Régie Radio', code: 'REG' },
            { id: 'SERV_RADIO_4', nom: 'Technique', code: 'TECH' }
          ]
        },
        {
          id: 'SD_RADIO_3',
          nom: 'Rédaction Radio',
          code: 'RED_RADIO',
          services: [
            { id: 'SERV_RADIO_5', nom: 'Rédaction', code: 'RED' },
            { id: 'SERV_RADIO_6', nom: 'Animateurs', code: 'ANI' }
          ]
        }
      ]
    },
    { 
      id: 'COM', 
      nom: 'Communication Nationale', 
      code: 'COM',
      sousDirections: [
        {
          id: 'SD_COM_1',
          nom: 'Relations Publiques',
          code: 'RP',
          services: [
            { id: 'SERV_COM_1', nom: 'Relations Presse', code: 'PRE' },
            { id: 'SERV_COM_2', nom: 'Relations Publiques', code: 'PUB' }
          ]
        },
        {
          id: 'SD_COM_2',
          nom: 'Communication Institutionnelle',
          code: 'CI',
          services: [
            { id: 'SERV_COM_3', nom: 'Communication Interne', code: 'INT' },
            { id: 'SERV_COM_4', nom: 'Communication Externe', code: 'EXT' }
          ]
        },
        {
          id: 'SD_COM_3',
          nom: 'Événementiel',
          code: 'EVT',
          services: [
            { id: 'SERV_COM_5', nom: 'Organisation Événements', code: 'ORG' },
            { id: 'SERV_COM_6', nom: 'Logistique', code: 'LOG' }
          ]
        }
      ]
    }
  ],

  // Chefs de service (basés sur les comptes du backend)
  chefs: [
    { id: 'chef.tv@onama.td', nom: 'Chef', prenom: 'Service TV', email: 'chef.tv@onama.td', serviceId: 'SERV_TV_1' },
    { id: 'chef.radio@onama.td', nom: 'Chef', prenom: 'Service Radio', email: 'chef.radio@onama.td', serviceId: 'SERV_RADIO_1' },
    { id: 'chef.com@onama.td', nom: 'Chef', prenom: 'Service Communication', email: 'chef.com@onama.td', serviceId: 'SERV_COM_1' }
  ]
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Obtenir le nom d'une direction
export function getDirectionName(code: string): string {
  const dir = ONAMA_ORG.directions.find(d => d.code === code);
  return dir ? dir.nom : code;
}

// Obtenir toutes les sous-directions d'une direction
export function getSousDirections(directionCode: string): any[] {
  const dir = ONAMA_ORG.directions.find(d => d.code === directionCode);
  return dir ? dir.sousDirections : [];
}

// Obtenir tous les services d'une direction
export function getAllServices(directionCode: string): any[] {
  const dir = ONAMA_ORG.directions.find(d => d.code === directionCode);
  if (!dir) return [];
  
  let allServices: any[] = [];
  dir.sousDirections.forEach(sd => {
    allServices = [...allServices, ...sd.services];
  });
  return allServices;
}

// Obtenir les services d'une sous-direction spécifique
export function getServicesBySousDirection(directionCode: string, sousDirectionCode: string): any[] {
  const dir = ONAMA_ORG.directions.find(d => d.code === directionCode);
  if (!dir) return [];
  
  const sd = dir.sousDirections.find(s => s.code === sousDirectionCode);
  return sd ? sd.services : [];
}

// Obtenir les chefs par service
export function getChefsByService(serviceId: string): any[] {
  return ONAMA_ORG.chefs.filter(c => c.serviceId === serviceId);
}

// Obtenir tous les chefs d'une direction
export function getChefsByDirection(directionCode: string): any[] {
  const services = getAllServices(directionCode);
  const serviceIds = services.map(s => s.id);
  return ONAMA_ORG.chefs.filter(c => serviceIds.includes(c.serviceId));
}

// ============================================
// STATISTIQUES DE L'ORGANIGRAMME
// ============================================

export const ORGANIGRAMME_STATS = {
  directions: ONAMA_ORG.directions.length,
  sousDirections: ONAMA_ORG.directions.reduce((acc, dir) => acc + dir.sousDirections.length, 0),
  services: ONAMA_ORG.directions.reduce((acc, dir) => 
    acc + dir.sousDirections.reduce((sum, sd) => sum + sd.services.length, 0), 0),
  chefs: ONAMA_ORG.chefs.length
};

console.log('📊 Organigramme ONAMA:');
console.log(`   ${ORGANIGRAMME_STATS.directions} Directions`);
console.log(`   ${ORGANIGRAMME_STATS.sousDirections} Sous-directions`);
console.log(`   ${ORGANIGRAMME_STATS.services} Services`);
console.log(`   ${ORGANIGRAMME_STATS.chefs} Chefs de service`);