import { InjectionToken } from '@angular/core';

export const SEO_SITE_URL = new InjectionToken<string>('SEO_SITE_URL', {
  providedIn: 'root',
  factory: () => '',
});
