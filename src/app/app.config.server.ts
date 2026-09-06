import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SEO_SITE_URL } from './seo/seo.tokens';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: SEO_SITE_URL, useValue: process.env['SITE_URL'] ?? '' },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
