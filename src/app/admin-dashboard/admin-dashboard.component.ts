import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GalleryImage } from '../models/gallery-image.model';
import { SeoService } from '../seo/seo.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly seo = inject(SeoService);
  readonly categories = [
    'حجر',
    'رخام',
    'قراميط البناء',
    'دهانات',
    'سيراميك',
    'ألوميتال',
    'ديكور',
    'كهرباء',
  ];
  readonly images = signal<GalleryImage[]>([]);
  readonly selectedFiles = signal<File[]>([]);
  readonly previews = signal<string[]>([]);
  readonly title = signal('');
  readonly category = signal(this.categories[0]);
  readonly password = signal('');
  readonly busy = signal(false);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error' | ''>('');

  constructor(private readonly http: HttpClient, @Inject(PLATFORM_ID) platformId: object) {
    this.seo.setNoIndexPage('إدارة الصور | الفهد للتشطيبات والديكور');
    if (isPlatformBrowser(platformId)) void this.loadImages();
  }

  updateText(field: 'title' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'title') this.title.set(value);
    else this.password.set(value);
  }

  updateCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 8);
    this.selectedFiles.set(files);
    this.previews.set(files.map((file) => URL.createObjectURL(file)));
    this.message.set(files.length < (input.files?.length ?? 0) ? 'تم اختيار أول 8 صور فقط.' : '');
  }

  async loadImages(): Promise<void> {
    try {
      this.images.set(await firstValueFrom(this.http.get<GalleryImage[]>('/api/gallery')));
    } catch {
      this.showMessage('تعذر تحميل الصور المنشورة.', 'error');
    }
  }

  async upload(): Promise<void> {
    const title = this.title().trim();
    if (!title || !this.selectedFiles().length || !this.password()) {
      this.showMessage('أدخل كلمة المرور والعنوان واختر صورة واحدة على الأقل.', 'error');
      return;
    }

    this.busy.set(true);
    this.message.set('');
    try {
      for (const file of this.selectedFiles()) {
        const dataUrl = await this.readFile(file);
        const image = await firstValueFrom(
          this.http.post<GalleryImage>(
            '/api/gallery',
            { title, category: this.category(), dataUrl },
            { headers: this.authHeaders() }
          )
        );
        this.images.update((items) => [image, ...items]);
      }
      this.title.set('');
      this.selectedFiles.set([]);
      this.previews.set([]);
      this.showMessage('تم رفع الصور وإضافتها إلى معرض الموقع.', 'success');
    } catch (error) {
      const status = (error as { status?: number }).status;
      this.showMessage(
        status === 401
          ? 'كلمة المرور غير صحيحة.'
          : status === 503
          ? 'إدارة الصور غير مفعّلة على الخادم بعد.'
          : 'تعذر رفع الصور. تأكد أن حجم كل صورة أقل من 6 ميجابايت.',
        'error'
      );
    } finally {
      this.busy.set(false);
    }
  }

  async deleteImage(image: GalleryImage): Promise<void> {
    if (!this.password()) {
      this.showMessage('أدخل كلمة مرور الإدارة أولًا.', 'error');
      return;
    }
    try {
      await firstValueFrom(
        this.http.delete(`/api/gallery/${encodeURIComponent(image.id)}`, {
          headers: this.authHeaders(),
        })
      );
      this.images.update((items) => items.filter((item) => item.id !== image.id));
      this.showMessage('تم حذف الصورة من المعرض.', 'success');
    } catch {
      this.showMessage('تعذر حذف الصورة. تحقق من كلمة المرور.', 'error');
    }
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-admin-password': this.password() });
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message.set(message);
    this.messageType.set(type);
  }
}
