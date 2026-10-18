import mongoose, { Schema } from 'mongoose';

const serviceVariantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      amount: {
        type: Number,
        nullable: true,
      },
      type: {
        type: String,
        enum: ['fixed', 'starting_from', 'on_request'],
      },
    },
  },
  { _id: false }
);

const galleryImageSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const priceSchema = new Schema(
  {
    amount: {
      type: Number,
      nullable: true,
      validate: {
        validator: function (val) {
          const price = this;
          if (price.type === 'on_request') {
            return val === null || val === undefined;
          }
          return val !== null && val !== undefined && val > 0;
        },
        message: 'Invalid price amount for the given type',
      },
    },
    type: {
      type: String,
      enum: ['fixed', 'starting_from', 'on_request'],
      required: true,
    },
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]{3,120}$/, 'Slug must be 3-120 lowercase alphanumeric characters with hyphens'],
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mainImage: {
      type: String,
    },
    gallery: {
      type: [galleryImageSchema],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    price: {
      type: priceSchema,
      required: true,
      default: { amount: null, type: 'on_request' },
    },
    variants: {
      type: [serviceVariantSchema],
      default: [],
    },
    visibility: {
      homepage: {
        type: Boolean,
        default: false,
      },
      servicesPage: {
        type: Boolean,
        default: true,
      },
      allLocations: {
        type: Boolean,
        default: false,
      },
    },
    locationIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for status, isActive, and sortOrder queries
serviceSchema.index({ status: 1, isActive: 1, sortOrder: 1 });
serviceSchema.index({ status: 1, isActive: 1, 'visibility.allLocations': 1 });

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
