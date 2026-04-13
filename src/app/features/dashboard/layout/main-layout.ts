import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  user: any;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  
  private socket: Socket;
  private apiUrl = 'http://localhost:5000';

  constructor(private router: Router) {
    this.chargerUtilisateur();
    
    // Configuration Socket.IO avec reconnexion automatique
    this.socket = io(this.apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    
    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs) {
      this.notifications = JSON.parse(savedNotifs);
      this.updateUnreadCount();
    }
  }

  ngOnInit() {
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  chargerUtilisateur() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    } else {
      this.router.navigate(['/login']);
    }
  }

  hasRole(roles: string[]): boolean {
    return this.user && roles.includes(this.user.role);
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur de notifications');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur de notifications');
    });

    // Nouvelle candidature
    this.socket.on('nouvelle_candidature', (data: any) => {
      console.log('📢 Nouvelle candidature reçue:', data);
      this.addNotification({
        id: Date.now(),
        type: 'candidature',
        title: '📄 Nouvelle candidature',
        message: `${data.prenom} ${data.nom} a déposé une candidature`,
        time: new Date(),
        read: false,
        data: data
      });
    });

    // Candidature validée par secrétariat
    this.socket.on('candidature_validee_sec', (data: any) => {
      console.log('✅ Candidature validée:', data);
      this.addNotification({
        id: Date.now(),
        type: 'validation',
        title: '✅ Candidature validée',
        message: `La candidature de ${data.prenom} ${data.nom} a été validée par le secrétariat`,
        time: new Date(),
        read: false,
        data: data
      });
    });

    // Lettre validée
    this.socket.on('lettre_validee', (data: any) => {
      console.log('📝 Lettre validée:', data);
      this.addNotification({
        id: Date.now(),
        type: 'lettre',
        title: '📝 Lettre validée',
        message: `La lettre de ${data.prenom} ${data.nom} a été validée`,
        time: new Date(),
        read: false,
        data: data
      });
    });
  }

  addNotification(notification: any) {
    this.notifications.unshift(notification);
    this.updateUnreadCount();
    
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
    
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notification: any) {
    notification.read = true;
    this.updateUnreadCount();
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.markAllAsRead();
    }
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'candidature': return '📄';
      case 'validation': return '✅';
      case 'lettre': return '📝';
      default: return '🔔';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    this.router.navigate(['/login']);
  }
}