import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]) => {
  const router = inject(Router);
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return router.parseUrl('/login');
  }
  
  const user = JSON.parse(userStr);
  
  if (allowedRoles.includes(user.role)) {
    return true;
  }
  
  return router.parseUrl('/dashboard/accueil');
};