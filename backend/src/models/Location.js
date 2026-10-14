import mongoose, { Schema } from 'mongoose';

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

const locationSchema = new Schema(
  {
    regionId: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'Region ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Location name is required'],
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
    address: {
      type: String,
      trim: true,
    },
    mapUrl: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
    },
    gallery: {
      type: [galleryImageSchema],
      default: [],
    },
    photographyPrice: {
      type: priceSchema,
      required: true,
      default: { amount: null, type: 'on_request' },
    },
    venuePrice: {
      type: priceSchema,
      required: true,
      default: { amount: null, type: 'on_request' },
    },
    showTotal: {
      type: Boolean,
      default: false,
    },
    relatedServiceIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
      default: [],
    },
    relatedLocationIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

// Indexes for queries
locationSchema.index({ regionId: 1, status: 1, sortOrder: 1 });
locationSchema.index({ isFeatured: 1, status: 1 });

export const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
export default Location;
