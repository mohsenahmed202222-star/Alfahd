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
        <div class="dialog-img">
          <img [src]="service.image" [alt]="service.title" />
        </div>
        <div class="dialog-content">
          <span class="dialog-cat">{{ service.category }}</span>
          <h3>{{ service.title }}</h3>
          <p class="dialog-sub">{{ service.subtitle }}</p>
          <p>{{ service.description }}</p>
          <div class="dialog-actions">
            <button class="dialog-close-btn" (click)="close.emit()">إغلاق</button>
            <a
              [href]="getWhatsAppLink()"
              target="_blank"
              rel="noreferrer"
              class="btn btn-primary"
            >
              اطلب الآن
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .dialog-box {
      background: var(--charcoal-2);
      border: 1px solid var(--border);
      border-radius: 18px;
      max-width: 600px; width: 100%;
      overflow: hidden;
    }
    .dialog-img { height: 280px; }
    .dialog-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .dialog-content { padding: 28px; }
    .dialog-cat {
      display: inline-block;
      background: rgba(201,168,76,0.12);
      border: 1px solid rgba(201,168,76,0.3);
      color: var(--gold-light);
      font-size: 11px; font-weight: 700;
      padding: 3px 12px; border-radius: 100px;
      margin-bottom: 12px; letter-spacing: 0.5px;
    }
    .dialog-content h3 {
      font-size: 22px; font-weight: 700;
      color: var(--warm-white); margin-bottom: 6px;
    }
    .dialog-sub {
      font-size: 13px; color: var(--gold-light);
      margin-bottom: 12px !important;
    }
    .dialog-content p {
      font-size: 14px; color: var(--stone-light);
      line-height: 1.8; margin-bottom: 24px;
    }
    .dialog-actions {
      display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
    }
    .dialog-close-btn {
      cursor: pointer;
      background: none;
      border: 1px solid rgba(201,168,76,0.2);
      color: var(--stone-light);
      padding: 10px 20px; border-radius: 7px;
      font-family: 'Cairo', sans-serif;
      font-size: 13px; font-weight: 600;
      transition: .2s;
    }
    .dialog-close-btn:hover { border-color: var(--gold); color: var(--gold-light); }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; border-radius: 8px; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all .25s; border: none; }
    .btn-primary { background: linear-gradient(135deg, var(--gold-dark), var(--gold)); color: var(--charcoal); box-shadow: 0 4px 20px rgba(201,168,76,0.25); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.4); }
  `]
})
export class ServiceDialogComponent {
  @Input({ required: true }) service!: Service;
  @Output() close = new EventEmitter<void>();

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