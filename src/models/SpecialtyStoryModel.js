const mongoose = require("mongoose");

const specialtyStoryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const specialtyStorySchema = new mongoose.Schema(
  {
    specialty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    cover_image_url: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [specialtyStoryImageSchema],
      default: [],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    published_at: {
      type: Date,
      default: null,
    },
    seo_title: {
      type: String,
      default: "",
      trim: true,
    },
    seo_description: {
      type: String,
      default: "",
      trim: true,
    },
    view_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

specialtyStorySchema.index({ specialty_id: 1, status: 1 });
specialtyStorySchema.index({ status: 1, published_at: -1 });

const SpecialtyStory = mongoose.model("SpecialtyStory", specialtyStorySchema);

module.exports = SpecialtyStory;
