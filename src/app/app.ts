import {
  Component,
  signal,
  computed,
  OnInit,
  AfterViewInit,
  Inject,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from './models/service.model';
import { SERVICES, CATEGORIES } from './data/services.data';
import { ServiceDialogComponent } from './components/service-dialog/service-dialog.component';
import { HttpClient } from '@angular/common/http';
import { GalleryImage } from './models/gallery-image.model';
import { SeoService } from './seo/seo.service';
import { SERVICE_LANDING_PAGES } from './seo/service-pages.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceDialogComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  // ── Signals ──────────────────────────────────────────────
  searchTerm = signal('');
  selectedCategory = signal('الكل');
  selectedService = signal<Service | null>(null);
  showDialog = signal(false);
  menuOpen = signal(false);
  serviceLandingPages = SERVICE_LANDING_PAGES;
  galleryImages = signal<GalleryImage[]>([
    { id: 'existing-1', title: 'واجهة فيلا فاخرة', category: 'حجر', url: '/img/mmm.jpeg' },
    {
      id: 'existing-2',
      title: 'أرضيات رخام',
      category: 'رخام',
      url: '/img/WhatsApp Image 2026-09-02 at 1.36.57 AM.jpeg',
    },
    {
      id: 'existing-3',
      title: 'رخام مطابخ',
      category: 'رخام',
      url: '/img/c2052b3d632a372715e981e6f94cb825.jpg',
    },
    {
      id: 'existing-4',
      title: 'ديكور داخلي',
      category: 'ديكور',
      url: '/img/4f95221c1060a2d9cf0d92d2f4e474d1.jpg',
    },
    {
      id: 'existing-5',
      title: 'إضاءة ديكور',
      category: 'كهرباء',
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80',
    },
  ]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private readonly http: HttpClient) {
    this.seo.setHomePage();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<GalleryImage[]>('/api/gallery').subscribe({
        next: (images) => this.galleryImages.update((current) => [...current, ...images]),
      });
    }
  }

  // ── Static data ──────────────────────────────────────────
  categories = signal<string[]>(CATEGORIES);

  // ── Derived ──────────────────────────────────────────────
  filteredServices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const cat = this.selectedCategory();
    return SERVICES.filter((s) => {
      const catOk = cat === 'الكل' || s.category === cat;
      const termOk =
        !term ||
        s.title.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term);
      return catOk && termOk;
    });
  });

  // ── Handlers ─────────────────────────────────────────────
  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  openDetails(service: Service): void {
    this.selectedService.set(service);
    this.showDialog.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeDetails(): void {
    this.showDialog.set(false);
    this.selectedService.set(null);
    document.body.style.overflow = '';
  }

  getWhatsAppLink(service: Service): string {
    const msg = encodeURIComponent('أريد الاستفسار عن: ' + service.title);
    return `https://wa.me/201200231818?text=${msg}`;
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  // ── Scroll animations ─────────────────────────────────────
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          }),
        { threshold: 0.12 }
      );
      document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    }
  }
}
