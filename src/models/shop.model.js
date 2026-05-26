const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    
    owner_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    cover_image: {
      type: String,
      default: "",
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    geohash: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    formatted_address: {
      type: String,
      default: "",
      trim: true,
    },
    province_id: {
      type: Number,
      default: null,
    },
    district_id: {
      type: Number,
      default: null,
    },
    ward_code: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    block_reason: {
      type: String,
      default: "",
      trim: true,
    },
    blocked_at: {
      type: Date,
      default: null,
    },
    blocked_by: {
      type: String,
      default: "",
      trim: true,
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

shopSchema.index({ location: "2dsphere" });
shopSchema.index({ geohash: 1, status: 1 });

module.exports = mongoose.model("Shop", shopSchema);
