import mongoose, { Schema } from 'mongoose';

const homepageSectionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const portfolioItemSchema = new Schema(
  {
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
    },
    photographerName: {
      type: String,
      required: [true, 'Photographer name is required'],
      trim: true,
      default: 'المصور',
    },
    logo: {
      type: String,
    },
    favicon: {
      type: String,
    },
    hero: {
      title: {
        type: String,
        required: true,
        trim: true,
        default: 'توثيق أجمل لحظات العمر بلمسة فنية مميزة',
      },
      description: {
        type: String,
        required: true,
        trim: true,
        default: 'متخصصون في تصوير حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
      },
      imageUrl: {
        type: String,
        default: '',
      },
      images: {
        type: [String],
        default: [],
      },
      primaryCtaText: {
        type: String,
        required: true,
        trim: true,
        default: 'استكشف أماكن التصوير',
      },
      primaryCtaUrl: {
        type: String,
        required: true,
        trim: true,
        default: '/locations',
      },
      secondaryCtaText: {
        type: String,
        required: true,
        trim: true,
        default: 'تواصل عبر واتساب',
      },
      secondaryCtaUrl: {
        type: String,
        required: true,
        trim: true,
        default: 'https://wa.me/',
      },
    },
    about: {
      bio: {
        type: String,
        required: true,
        trim: true,
        default: 'مصور فوتوغرافي محترف متخصص في توثيق حفلات الزفاف بأعلى جودة واهتمام بأدق التفاصيل.',
      },
      imageUrl: {
        type: String,
      },
    },
    homepageSections: {
      type: [homepageSectionSchema],
      default: [
        { id: 'hero', enabled: true, order: 1, title: 'القسم الرئيسي' },
        { id: 'about', enabled: true, order: 2, title: 'عن المصور' },
        { id: 'featured_regions', enabled: true, order: 3, title: 'أبرز المناطق' },
        { id: 'featured_locations', enabled: true, order: 4, title: 'أماكن مختارة للتصوير' },
        { id: 'portfolio', enabled: true, order: 5, title: 'معرض الأعمال' },
        { id: 'services', enabled: true, order: 6, title: 'خدمات إضافية' },
        { id: 'how_it_works', enabled: true, order: 7, title: 'كيف نعمل' },
        { id: 'contact', enabled: true, order: 8, title: 'تواصل معنا' },
      ],
    },
    featuredRegionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Region',
      default: [],
    },
    featuredLocationIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      default: [],
    },
    portfolioItems: {
      type: [portfolioItemSchema],
      default: [],
    },
    featuredServiceIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
      default: [],
    },
    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
        default: '01000000000',
      },
      whatsappNumber: {
        type: String,
        required: true,
        trim: true,
        default: '201000000000',
      },
      defaultWhatsappMessage: {
        type: String,
        required: true,
        trim: true,
        default: 'مرحباً، أود الاستفسار عن تفاصيل جلسات التصوير والأسعار.',
      },
      instagram: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
    },
    socialLinks: {
      instagram: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
      youtube: {
        type: String,
        trim: true,
      },
      tiktok: {
        type: String,
        trim: true,
      },
    },
    defaultSeo: {
      title: {
        type: String,
        required: true,
        trim: true,
        default: 'مصور أفراح محترف - جلسات تصوير زفاف وأماكن تصوير متميزة',
      },
      description: {
        type: String,
        required: true,
        trim: true,
        default: 'أفضل أماكن تصوير سيشن الزفاف والخدمات الإضافية بأعلى جودة واحترافية.',
      },
    },
    footer: {
      copyrightText: {
        type: String,
        required: true,
        trim: true,
        default: 'جميع الحقوق محفوظة ©',
      },
      privacyNotice: {
        type: String,
        trim: true,
      },
    },
    currencyLabel: {
      type: String,
      required: true,
      default: 'جنيه',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
