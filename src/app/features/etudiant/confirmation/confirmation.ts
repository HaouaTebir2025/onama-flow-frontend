import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.scss']
})
export class ConfirmationComponent implements OnInit {
  numeroDossier = '';
  user: any;

  constructor(private route: ActivatedRoute) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.numeroDossier = params['numeroDossier'] || '';
    });
  }
}