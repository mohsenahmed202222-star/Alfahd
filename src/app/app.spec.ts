import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should use the updated WhatsApp number', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const link = app.getWhatsAppLink({
      title: 'تجربة',
      category: 'رخام',
      subtitle: 'خدمة',
      description: 'وصف',
      image: '',
      images: [],
    } as any);

    expect(link).toContain('201200231818');
  });
});
