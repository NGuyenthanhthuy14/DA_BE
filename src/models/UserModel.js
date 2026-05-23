const mongoose = require("mongoose");

const addressBookSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    province_id: {
      type: Number,
      default: null,
    },
    district: {
      type: String,
      default: "",
      trim: true,
    },
    district_id: {
      type: Number,
      default: null,
    },
    ward: {
      type: String,
      default: "",
      trim: true,
    },
    ward_code: {
      type: String,
      default: "",
      trim: true,
    },
    detail: {
      type: String,
      default: "",
      trim: true,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      unique: false,
      sparse: true, 
    },

    password_hash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    vendor_status: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    blocked_reason: {
      type: String,
      default: "",
      trim: true,
    },

    avatar_url: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    favorite_shops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
    ],

    address_book: [addressBookSchema],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
