import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  nonLues = 0;
  showDropdown = false;
  private socket: Socket;
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:5000');
  }

  ngOnInit() {
    this.chargerNotifications();
    this.ecouterNotifications();
    this.demanderPermissionNotification();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  chargerNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.get(`${this.apiUrl}/lettres-en-attente`, { headers }).subscribe({
      next: (data: any) => {
        this.notifications = data.map((n: any) => ({
          ...n,
          lu: false,
          date: new Date().toLocaleString()
        }));
        this.nonLues = this.notifications.filter(n => !n.lu).length;
      },
      error: (err) => console.error('Erreur chargement:', err)
    });
  }

  ecouterNotifications() {
    this.socket.on('nouvelle_lettre', (data: any) => {
      this.notifications.unshift({
        ...data,
        lu: false,
        date: new Date().toLocaleString()
      });
      this.nonLues++;
      this.jouerSon();
      this.afficherNotification(data);
    });
  }

  jouerSon() {
    try {
      const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Son non joué'));
    } catch (e) {}
  }

  afficherNotification(data: any) {
    if (Notification.permission === 'granted') {
      new Notification('Nouvelle lettre de stage', {
        body: `${data.prenom} ${data.nom} a déposé une lettre`,
        icon: '/images/logo-onama.png.webp'
      });
    }
  }

  demanderPermissionNotification() {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  marquerCommeLu(notification: any) {
    notification.lu = true;
    this.nonLues = this.notifications.filter(n => !n.lu).length;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.notifications.forEach(n => n.lu = true);
      this.nonLues = 0;
    }
  }
}