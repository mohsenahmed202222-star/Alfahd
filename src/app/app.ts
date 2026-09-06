import {
  Component,
  signal,
  computed,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from './models/service.model';
import { SERVICES, CATEGORIES } from './data/services.data';
import { ServiceDialogComponent } from './components/service-dialog/service-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceDialogComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements AfterViewInit {
  // ── Signals ──────────────────────────────────────────────
  searchTerm = signal('');
  selectedCategory = signal('الكل');
  selectedService = signal<Service | null>(null);
  showDialog = signal(false);
  menuOpen = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
