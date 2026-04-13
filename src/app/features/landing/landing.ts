import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentSlide = 0;
  isMenuOpen = false;
  
  stats = {
    stagiaires: 0,
    directions: 0,
    services: 0,
    partenaires: 0
  };
  
  temoignages = [
    {
      nom: 'Dr. Mahamat Saleh',
      poste: 'Directeur des Ressources Humaines',
      message: 'ONAMA FLOW a révolutionné la gestion des stages. Un outil indispensable pour notre institution.',
      avatar: 'MS'
    },
    {
      nom: 'Fatimé Abakar',
      poste: 'Chef de Service Communication',
      message: 'La plateforme est intuitive et permet un suivi efficace des stagiaires. Je recommande vivement !',
      avatar: 'FA'
    },
    {
      nom: 'Ahmed Moussa',
      poste: 'Stagiaire 2024',
      message: 'Déposer ma candidature en ligne a été très simple. J\'ai été informé à chaque étape.',
      avatar: 'AM'
    }
  ];
  
  actualites = [
    {
      titre: 'Nouvelle session de recrutement',
      date: '15 Mars 2025',
      description: 'Les candidatures pour la session de Juillet sont ouvertes jusqu\'au 30 Mai 2025.',
      icon: '📢'
    },
    {
      titre: 'Partenariat avec les universités',
      date: '10 Février 2025',
      description: 'ONAMA signe une convention avec 5 universités pour faciliter les stages.',
      icon: '🤝'
    },
    {
      titre: 'Plateforme certifiée',
      date: '5 Janvier 2025',
      description: 'ONAMA FLOW obtient la certification qualité ISO 9001.',
      icon: '🏆'
    }
  ];

  constructor() {}

  ngOnInit() {
    this.startAnimations();
    this.startCarousel();
  }

  startAnimations() {
    const targets = [125, 3, 25, 8];
    const durations = [2000, 1500, 2000, 1500];
    
    targets.forEach((target, i) => {
      const key = Object.keys(this.stats)[i] as keyof typeof this.stats;
      this.animateValue(key, 0, target, durations[i]);
    });
  }

  animateValue(key: keyof typeof this.stats, start: number, end: number, duration: number) {
    const step = Math.ceil(duration / 50);
    const increment = (end - start) / step;
    let current = start;
    let count = 0;
    
    const timer = setInterval(() => {
      current += increment;
      count++;
      this.stats[key] = Math.min(Math.floor(current), end);
      
      if (count >= step) {
        this.stats[key] = end;
        clearInterval(timer);
      }
    }, 50);
  }

  startCarousel() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.temoignages.length;
    }, 5000);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen = false;
  }
}