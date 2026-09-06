import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SERVICES } from '../data/services.data';
import { Service } from '../models/service.model';
import { SeoService } from './seo.service';
import { SERVICE_LANDING_PAGES, ServiceLandingPage } from './service-pages.data';

@Component({
  selector: 'app-service-landing',
  imports: [RouterLink],
  templateUrl: './service-landing.component.html',
  styleUrl: './service-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLandingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly page = signal<ServiceLandingPage | null>(null);
  readonly services = signal<Service[]>([]);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const page = SERVICE_LANDING_PAGES.find((item) => item.slug === params.get('slug')) ?? null;
      this.page.set(page);
      this.services.set(
        page ? SERVICES.filter((service) => service.category === page.category) : []
      );
      if (page) this.seo.setServicePage(page);
      else this.seo.setNoIndexPage('الخدمة غير موجودة | الفهد للتشطيبات والديكور');
    });
  }

  getWhatsAppLink(): string {
    const serviceName = this.page()?.category ?? 'التشطيبات';
    const message = encodeURIComponent(`أريد الاستفسار عن خدمة ${serviceName}`);
    return `https://wa.me/201200231818?text=${message}`;
  }
}
