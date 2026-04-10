import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface ServiceItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  image: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  readonly whatsAppNumber = '201011933492';
  readonly categories = signal([
    'الكل',
    'الديكور',
    'الرخام',
    'الحجر',
    'السيراميك',
    'الإضاءة',
    'الجبس',
  ]);
  readonly selectedCategory = signal('الكل');

  readonly services = signal<ServiceItem[]>([
    {
      id: 1,
      title: 'تشطيب رخام داخلي وخارجي',
      subtitle: 'أسطح، بدرومات، وجدران',
      description:
        'تركيب رخام عالي الجودة بتشطيبات ناعمة ودرجات ألوان متناسقة لتعطي لمسة فاخرة للمساحات.',
      category: 'الرخام',
      image:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1100&q=80',
    },
    {
      id: 2,
      title: 'حجر طبيعي للواجهات والديكور',
      subtitle: 'حجر خارجي وداخلي فاخر',
      description: 'تصميم وتركيب الحجر الطبيعي لتجميل الواجهات والأركان وإبراز التفاصيل المعمارية.',
      category: 'الحجر',
      image:
        'https://images.unsplash.com/photo-1600573473330-f5d96b5f2f96?auto=format&fit=crop&w=1100&q=80',
    },
    {
      id: 3,
      title: 'سيراميك وأرضيات مودرن',
      subtitle: 'تصاميم معاصرة للمطابخ والصالونات',
      description: 'نركب لك أفضل أنواع السيراميك بمقاسات وألوان تبرز جمال المساحة وتدوم لسنوات.',
      category: 'السيراميك',
      image:
        'https://images.unsplash.com/photo-1549187774-b4e9ff70dbf4?auto=format&fit=crop&w=1100&q=80',
    },
    {
      id: 4,
      title: 'تصميم جبس بورد راقي',
      subtitle: 'أسقف، فواصل، ونظام إضاءة مخفي',
      description: 'تنفيذ جبس بورد مميز مع تفاصيل دقيقة وعملية لإضافة لمسة زخرفية جذابة.',
      category: 'الجبس',
      image:
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1100&q=80',
    },
    {
      id: 5,
      title: 'إضاءات مخفية ومودرن',
      subtitle: 'إضاءة جدارية وسقفية احترافية',
      description: 'تركيب نظام إضاءة مخفي يعزز الفخامة ويضيف أجواء دافئة للمكان.',
      category: 'الإضاءة',
      image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1100&q=80',
    },
    {
      id: 6,
      title: 'تنفيذ ديكورات داخلية متكاملة',
      subtitle: 'تصميم المساحات والتشطيب النهائي',
      description: 'تصاميم ديكور داخلية مبتكرة وأنيقة تناسب الذوق العصري والراقي.',
      category: 'الديكور',
      image:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1100&q=80',
    },
  ]);

  readonly filteredServices = computed(() =>
    this.selectedCategory() === 'الكل'
      ? this.services()
      : this.services().filter((item) => item.category === this.selectedCategory())
  );

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  getWhatsAppLink(service: ServiceItem): string {
    const text = `السلام عليكم، أنا مهتم بخدمة ${service.title} - ${service.subtitle}. أريد معرفة الأسعار والتفاصيل.`;
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(text)}`;
  }
}
