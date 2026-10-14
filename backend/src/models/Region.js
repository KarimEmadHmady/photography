import mongoose, { Schema } from 'mongoose';

const regionSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Region name is required'],
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
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for status and sortOrder queries
regionSchema.index({ status: 1, sortOrder: 1 });

export const Region = mongoose.models.Region || mongoose.model('Region', regionSchema);
export default Region;
