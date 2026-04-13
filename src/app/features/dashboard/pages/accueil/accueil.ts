import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.scss']
})
export class AccueilComponent implements OnInit, OnDestroy {
  stats = {
    total: 0,
    depots: 0,
    valides: 0,
    programmes: 0,
    termines: 0,
    academique: 0,
    perfectionnement: 0
  };
  
  tendance = {
    depots: 0,
    valides: 0,
    programmes: 0,
    termines: 0
  };
  
  derniersStagiaires: any[] = [];
  recentesActivites: any[] = [];
  notifications: any[] = [];
  isLoading = true;
  error = '';
  user: any;
  dateDuJour: string = '';
  showNotifications = false;
  unreadCount = 0;
  
  chartData = {
    labels: ['Dépôts', 'Validés', 'Programmés', 'Terminés'],
    values: [0, 0, 0, 0],
    colors: ['#F59E0B', '#10B981', '#8B5CF6', '#6B7280']
  };

  private socket: Socket;
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    
    const today = new Date();
    this.dateDuJour = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.setupSocketListeners();
    
    const savedNotifs = localStorage.getItem('dashboard_notifications');
    if (savedNotifs) {
      this.notifications = JSON.parse(savedNotifs);
      this.updateUnreadCount();
    }
  }

  ngOnInit() {
    this.chargerDonnees();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur');
    });

    this.socket.on('nouvelle_candidature', (data: any) => {
      this.addNotification({
        id: Date.now(),
        type: 'candidature',
        title: 'Nouvelle candidature',
        message: `${data.prenom} ${data.nom} a déposé une candidature`,
        time: new Date(),
        read: false
      });
      this.chargerDonnees();
    });

    this.socket.on('candidature_validee_sec', (data: any) => {
      this.addNotification({
        id: Date.now(),
        type: 'validation',
        title: 'Candidature validée',
        message: `${data.prenom} ${data.nom} validé par le secrétariat`,
        time: new Date(),
        read: false
      });
      this.chargerDonnees();
    });
  }

  addNotification(notification: any) {
    this.notifications.unshift(notification);
    this.updateUnreadCount();
    if (this.notifications.length > 50) this.notifications.pop();
    localStorage.setItem('dashboard_notifications', JSON.stringify(this.notifications));
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notification: any) {
    notification.read = true;
    this.updateUnreadCount();
    localStorage.setItem('dashboard_notifications', JSON.stringify(this.notifications));
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
    localStorage.setItem('dashboard_notifications', JSON.stringify(this.notifications));
  }

  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    localStorage.setItem('dashboard_notifications', JSON.stringify(this.notifications));
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.markAllAsRead();
  }

  getNotificationIcon(type: string): string {
    const icons: any = { candidature: '📄', validation: '✅', lettre: '📝' };
    return icons[type] || '🔔';
  }

  chargerDonnees() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.error = 'Session expirée';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/stagiaires`, { headers }).subscribe({
      next: (data: any) => {
        this.calculerStatistiques(data);
        this.derniersStagiaires = data.slice(0, 5);
        this.genererActivitesRecentes(data);
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Session expirée';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          this.error = 'Erreur de chargement';
        }
        this.isLoading = false;
      }
    });
  }

  calculerStatistiques(stagiaires: any[]) {
    const ancienTotal = this.stats.total;
    
    this.stats.total = stagiaires.length;
    this.stats.depots = stagiaires.filter(s => s.statut === 'DEPOT').length;
    this.stats.valides = stagiaires.filter(s => s.statut === 'VALIDE').length;
    this.stats.programmes = stagiaires.filter(s => s.statut === 'PROGRAMME').length;
    this.stats.termines = stagiaires.filter(s => s.statut === 'TERMINE').length;
    this.stats.academique = stagiaires.filter(s => s.type === 'ACADEMIQUE').length;
    this.stats.perfectionnement = stagiaires.filter(s => s.type === 'PERFECTIONNEMENT').length;
    
    this.chartData.values = [
      this.stats.depots,
      this.stats.valides,
      this.stats.programmes,
      this.stats.termines
    ];
    
    if (ancienTotal > 0) {
      this.tendance.depots = Math.round((this.stats.depots / ancienTotal) * 100);
      this.tendance.valides = Math.round((this.stats.valides / ancienTotal) * 100);
      this.tendance.programmes = Math.round((this.stats.programmes / ancienTotal) * 100);
      this.tendance.termines = Math.round((this.stats.termines / ancienTotal) * 100);
    }
  }

  genererActivitesRecentes(stagiaires: any[]) {
    this.recentesActivites = stagiaires.slice(0, 6).map(s => ({
      id: s.id,
      nom: s.nom,
      prenom: s.prenom,
      action: s.statut === 'DEPOT' ? 'a déposé un dossier' :
              s.statut === 'VALIDE' ? 'a été validé' :
              s.statut === 'PROGRAMME' ? 'stage programmé' : 'stage terminé',
      date: s.dateDepot || s.updatedAt,
      statut: s.statut,
      avatar: this.getInitiales(s.nom, s.prenom)
    }));
  }

  getPourcentage(valeur: number): number {
    if (this.stats.total === 0) return 0;
    return Math.round((valeur / this.stats.total) * 100);
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'DEPOT': 'bg-amber-100 text-amber-700',
      'VALIDE': 'bg-emerald-100 text-emerald-700',
      'PROGRAMME': 'bg-purple-100 text-purple-700',
      'TERMINE': 'bg-gray-100 text-gray-700'
    };
    return colors[statut] || 'bg-gray-100 text-gray-700';
  }

  getStatutIcon(statut: string): string {
    const icons: any = {
      'DEPOT': '📋',
      'VALIDE': '✅',
      'PROGRAMME': '📅',
      'TERMINE': '🎓'
    };
    return icons[statut] || '📌';
  }

  // ============================================
  // ACTION SUPPRIMER (les autres actions sont des liens)
  // ============================================

  supprimerStagiaire(stagiaire: any) {
    if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer ${stagiaire.prenom} ${stagiaire.nom} ?\n\nCette action est irréversible.`)) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      
      this.http.delete(`${this.apiUrl}/stagiaires/${stagiaire.id}`, { headers }).subscribe({
        next: () => {
          this.chargerDonnees();
          this.addNotification({
            id: Date.now(),
            type: 'suppression',
            title: '🗑️ Stagiaire supprimé',
            message: `${stagiaire.prenom} ${stagiaire.nom} a été supprimé`,
            time: new Date(),
            read: false
          });
          alert(`✅ ${stagiaire.prenom} ${stagiaire.nom} a été supprimé avec succès.`);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('❌ Erreur lors de la suppression. Veuillez réessayer.');
        }
      });
    }
  }

  reconnecter() {
    window.location.href = '/login';
  }
}