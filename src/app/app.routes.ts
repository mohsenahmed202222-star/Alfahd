import { Routes } from '@angular/router';
import { AppComponent } from './app';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ServiceLandingComponent } from './seo/service-landing.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'services/:slug', component: ServiceLandingComponent },
  { path: '**', redirectTo: '' },
];
