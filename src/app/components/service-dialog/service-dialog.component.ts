import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay open" (click)="onOverlayClick($event)">
      <div class="dialog-box">
        <div class="dialog-gallery">
          <div class="dialog-img">
            <img [src]="selectedImage" [alt]="service.title" />
          </div>

          <div class="dialog-thumbs" *ngIf="galleryImages.length > 1">
            <button
              type="button"
              *ngFor="let image of galleryImages"
              class="thumb-btn"
              [class.active]="image === selectedImage"
              (click)="selectedImage = image"
              [attr.aria-label]="'اختيار الصورة ' + image"
            >
              <img [src]="image" [alt]="service.title" />
            </button>
          </div>
        </div>

        <div class="dialog-content">
          <span class="dialog-cat">{{ service.category }}</span>
          <h3>{{ service.title }}</h3>
          <p class="dialog-sub">{{ service.subtitle }}</p>
          <p>{{ service.description }}</p>
          <div class="dialog-actions">
            <button class="dialog-close-btn" (click)="close.emit()">إغلاق</button>
            <a [href]="getWhatsAppLink()" target="_blank" rel="noreferrer" class="btn btn-primary">
              اطلب الآن
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        inset: 0;
        z-index: 9000;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .dialog-box {
        background: var(--charcoal-2);
        border: 1px solid var(--border);
        border-radius: 18px;
        max-width: 620px;
        width: min(100%, 620px);
        max-height: 88vh;
        overflow: hidden;
      }
      .dialog-gallery {
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid rgba(201, 168, 76, 0.14);
      }
      .dialog-img {
        height: 300px;
        overflow: hidden;
      }
      .dialog-img img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        background: #0d1117;
      }
      .dialog-thumbs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        padding: 10px 12px 12px;
        background: rgba(10, 14, 18, 0.25);
      }
      .thumb-btn {
        border: 1px solid rgba(201, 168, 76, 0.18);
        background: rgba(255, 255, 255, 0.02);
        padding: 0;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: 0.2s ease;
        height: 68px;
      }
      .thumb-btn.active {
        border-color: var(--gold);
        box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.2);
        transform: translateY(-1px);
      }
      .thumb-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .dialog-content {
        padding: 18px 20px 20px;
      }
      .dialog-cat {
        display: inline-block;
        background: rgba(201, 168, 76, 0.12);
        border: 1px solid rgba(201, 168, 76, 0.3);
        color: var(--gold-light);
        font-size: 10px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 100px;
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }
      .dialog-content h3 {
        font-size: 20px;
        font-weight: 700;
        color: var(--warm-white);
        margin-bottom: 4px;
      }
      .dialog-sub {
        font-size: 12px;
        color: var(--gold-light);
        margin-bottom: 10px !important;
      }
      .dialog-content p {
        font-size: 13px;
        color: var(--stone-light);
        line-height: 1.7;
        margin-bottom: 18px;
      }
      .dialog-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }
      .dialog-close-btn {
        cursor: pointer;
        background: none;
        border: 1px solid rgba(201, 168, 76, 0.2);
        color: var(--stone-light);
        padding: 9px 16px;
        border-radius: 7px;
        font-family: 'Cairo', sans-serif;
        font-size: 12px;
        font-weight: 600;
        transition: 0.2s;
      }
      .dialog-close-btn:hover {
        border-color: var(--gold);
        color: var(--gold-light);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 8px;
        font-family: 'Cairo', sans-serif;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.25s;
        border: none;
      }
      .btn-primary {
        background: linear-gradient(135deg, var(--gold-dark), var(--gold));
        color: var(--charcoal);
        box-shadow: 0 4px 20px rgba(201, 168, 76, 0.25);
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(201, 168, 76, 0.4);
      }

      @media (max-width: 640px) {
        .dialog-box {
          max-width: 92vw;
          max-height: 90vh;
        }
        .dialog-img {
          height: 220px;
        }
        .dialog-thumbs {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .dialog-content {
          padding: 16px 16px 18px;
        }
      }
    `,
  ],
})
export class ServiceDialogComponent {
  @Input({ required: true }) service!: Service;
  @Output() close = new EventEmitter<void>();

  selectedImage = '';

  get galleryImages(): string[] {
    if (this.service?.images && this.service.images.length > 0) {
      return this.service.images;
    }

    return this.service?.image ? [this.service.image] : [];
  }

  ngOnChanges(): void {
    if (this.galleryImages.length > 0) {
      this.selectedImage = this.galleryImages[0];
    }
  }

  getWhatsAppLink(): string {
    const msg = encodeURIComponent('أريد الاستفسار عن: ' + this.service.title);
    return `https://wa.me/201011933492?text=${msg}`;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close.emit();
    }
  }
}
