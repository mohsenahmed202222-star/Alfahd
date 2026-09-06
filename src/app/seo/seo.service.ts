import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SERVICES } from '../data/services.data';
import { SEO_SITE_URL } from './seo.tokens';
import { ServiceLandingPage } from './service-pages.data';

const HOME_TITLE = 'الفهد للتشطيبات والديكور | رخام وحجر وتشطيبات في مصر';
const HOME_DESCRIPTION =
  'الفهد للتشطيبات والديكور في مصر: تنفيذ الرخام والحجر والسيراميك والألوميتال والدهانات والديكورات بجودة واهتمام بالتفاصيل. تواصل لطلب معاينة وعرض سعر.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly configuredSiteUrl = inject(SEO_SITE_URL);

  setHomePage(): void {
    const origin = this.getOrigin();
    this.title.setTitle(HOME_TITLE);
    this.meta.updateTag({ name: 'description', content: HOME_DESCRIPTION });
    this.meta.updateTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'ar_EG' });
    this.meta.updateTag({ property: 'og:site_name', content: 'الفهد للتشطيبات والديكور' });
    this.meta.updateTag({ property: 'og:title', content: HOME_TITLE });
    this.meta.updateTag({ property: 'og:description', content: HOME_DESCRIPTION });
    this.meta.updateTag({ property: 'og:url', content: origin ? `${origin}/` : '' });
    this.meta.updateTag({
      property: 'og:image',
      content: `${origin}/img/marble-ventilated-facades-800x448.png`,
    });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: 'واجهة رخام من أعمال الفهد للتشطيبات',
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: HOME_TITLE });
    this.meta.updateTag({ name: 'twitter:description', content: HOME_DESCRIPTION });
    this.meta.updateTag({
      name: 'twitter:image',
      content: `${origin}/img/marble-ventilated-facades-800x448.png`,
    });
    this.setCanonical(origin, '/');
    this.setBusinessStructuredData(origin);
  }

  setServicePage(page: ServiceLandingPage): void {
    const origin = this.getOrigin();
    const title = `${page.title} | الفهد للتشطيبات والديكور`;
    const canonicalPath = `/services/${page.slug}`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'ar_EG' });
    this.meta.updateTag({ property: 'og:site_name', content: 'الفهد للتشطيبات والديكور' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: origin ? `${origin}${canonicalPath}` : '' });
    this.meta.updateTag({
      property: 'og:image',
      content: `${origin}/img/marble-ventilated-facades-800x448.png`,
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.setCanonical(origin, canonicalPath);
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.title,
      description: page.description,
      serviceType: page.category,
      areaServed: { '@type': 'Country', name: 'مصر' },
      provider: {
        '@type': 'Organization',
        name: 'الفهد للتشطيبات والديكور',
        telephone: '+201200231818',
        url: origin ? `${origin}/` : undefined,
      },
      mainEntityOfPage: origin ? `${origin}${canonicalPath}` : undefined,
    });
  }

  setNoIndexPage(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow,noarchive' });
    this.document.querySelector('link[rel="canonical"]')?.remove();
    this.document.getElementById('business-structured-data')?.remove();
  }

  private getOrigin(): string {
    const existingCanonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (existingCanonical?.href && !existingCanonical.href.includes('localhost')) {
      return new URL(existingCanonical.href).origin;
    }
    if (this.configuredSiteUrl) {
      try {
        return new URL(this.configuredSiteUrl).origin;
      } catch {}
    }
    const configuredOrigin = this.document.defaultView?.location.origin;
    if (isPlatformBrowser(this.platformId) && configuredOrigin) return configuredOrigin;
    if (this.request?.url) return new URL(this.request.url).origin;
    return '';
  }

  private setCanonical(origin: string, path: string): void {
    if (!origin) return;
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = `${origin}${path}`;
  }

  private setBusinessStructuredData(origin: string): void {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${origin}/#business`,
      name: 'الفهد للتشطيبات والديكور',
      description: HOME_DESCRIPTION,
      url: origin ? `${origin}/` : undefined,
      telephone: '+201200231818',
      image: origin ? `${origin}/img/marble-ventilated-facades-800x448.png` : undefined,
      areaServed: { '@type': 'Country', name: 'مصر' },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+201200231818',
        contactType: 'customer service',
        availableLanguage: ['Arabic'],
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'خدمات التشطيب',
        itemListElement: SERVICES.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            serviceType: service.category,
            description: service.description,
          },
        })),
      },
    };

    this.setStructuredData(data);
  }

  private setStructuredData(data: Record<string, unknown>): void {
    let script = this.document.getElementById(
      'business-structured-data'
    ) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'business-structured-data';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
