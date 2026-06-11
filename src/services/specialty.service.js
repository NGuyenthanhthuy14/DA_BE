import Specialty from "../models/SpecialtyModel";
import SpecialtyStory from "../models/SpecialtyStoryModel";
import Product from "../models/ProductModel";
import Shop from "../models/shop.model";
import { makeSlug } from "../utils/slugify.util";
import mongoose from "mongoose";

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];

const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = makeSlug(name) || Date.now().toString();
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Specialty.findOne(query).lean();
    if (!existing) break;

    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

const getVendorShopOrThrow = async (ownerId) => {
  const shop = await Shop.findOne({ owner_id: String(ownerId) });
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return shop;
};

export const validateApprovalStatus = (approvalStatus) => {
  return !approvalStatus || APPROVAL_STATUSES.includes(approvalStatus);
};

export const createSpecialty = async (body, creator = {}) => {
  const { name, description, image_url, slug } = body;

  if (!name) {
    throw new Error("NAME_REQUIRED");
  }

  const newSlug = await generateUniqueSlug(slug || name);
  const isVendor = creator.role === "vendor";

  return await Specialty.create({
    name,
    slug: newSlug,
    description: description || "",
    image_url: image_url || "",
    created_by: creator.userId || null,
    created_by_role: creator.role || "admin",
    shop_id: creator.shopId || null,
    approval_status: isVendor ? "pending" : "approved",
    rejected_reason: "",
    status: isVendor ? "inactive" : "active",
    reviewed_by: isVendor ? null : creator.userId || null,
    reviewed_at: isVendor ? null : new Date(),
  });
};

export const createVendorSpecialty = async (ownerId, body) => {
  const shop = await getVendorShopOrThrow(ownerId);
  return await createSpecialty(body, {
    userId: ownerId,
    role: "vendor",
    shopId: shop._id,
  });
};

export const getVendorSpecialties = async (ownerId, filter = {}) => {
  const shop = await getVendorShopOrThrow(ownerId);
  return await Specialty.find({
    ...filter,
    shop_id: shop._id,
  }).sort({ created_at: -1 }).lean();
};

const getVendorPendingSpecialtyOrThrow = async (ownerId, specialtyId) => {
  if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
    throw new Error("INVALID_ID");
  }

  const shop = await getVendorShopOrThrow(ownerId);
  const specialty = await Specialty.findById(specialtyId);

  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  if (!specialty.shop_id || specialty.shop_id.toString() !== shop._id.toString()) {
    throw new Error("SPECIALTY_NOT_OWNED");
  }

  if (specialty.approval_status !== "pending") {
    throw new Error("SPECIALTY_ALREADY_REVIEWED");
  }

  return specialty;
};

export const updateVendorSpecialty = async (ownerId, specialtyId, body) => {
  const specialty = await getVendorPendingSpecialtyOrThrow(ownerId, specialtyId);
  const updateData = {};

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    updateData.name = body.name;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    updateData.description = body.description || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "image_url")) {
    updateData.image_url = body.image_url || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "slug")) {
    updateData.slug = await generateUniqueSlug(body.slug || body.name || specialty.name, specialtyId);
  } else if (body.name && body.name !== specialty.name) {
    updateData.slug = await generateUniqueSlug(body.name, specialtyId);
  }

  updateData.approval_status = "pending";
  updateData.status = "inactive";
  updateData.rejected_reason = "";
  updateData.reviewed_by = null;
  updateData.reviewed_at = null;

  return await Specialty.findByIdAndUpdate(specialtyId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteVendorSpecialty = async (ownerId, specialtyId) => {
  const specialty = await getVendorPendingSpecialtyOrThrow(ownerId, specialtyId);
  await mongoose.connection.collection("shop_specialties").deleteMany({
    specialty_id: specialty._id,
  });
  return await Specialty.findByIdAndDelete(specialty._id);
};

export const getAllSpecialties = async (filter = {}) => {
  return await Specialty.find(filter).sort({ created_at: -1 }).lean();
};

export const getPublicSpecialties = async () => {
  return await getAllSpecialties({
    status: "active",
    approval_status: "approved",
  });
};

export const getNearbySpecialties = async (lat, lng, maxKm = 20, limit = 20) => {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  const maxKmNum = Number(maxKm);
  const limitNum = Number(limit);

  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lngNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lngNum < -180 ||
    lngNum > 180
  ) {
    throw new Error("INVALID_COORDINATES");
  }

  const radiusKm = Number.isFinite(maxKmNum) && maxKmNum > 0 ? maxKmNum : 20;
  const resultLimit = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20;

  return await Shop.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lngNum, latNum],
        },
        distanceField: "distanceMeters",
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: { status: "active" },
      },
    },
    {
      $lookup: {
        from: "specialties",
        let: { shopId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$shop_id", "$$shopId"] },
              status: "active",
              approval_status: "approved",
            },
          },
        ],
        as: "specialties",
      },
    },
    {
      $unwind: {
        path: "$specialties",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        distanceMeters: 1,
        "specialties.created_at": -1,
      },
    },
    {
      $limit: resultLimit,
    },
    {
      $project: {
        _id: "$specialties._id",
        name: "$specialties.name",
        slug: "$specialties.slug",
        description: "$specialties.description",
        image_url: "$specialties.image_url",
        approval_status: "$specialties.approval_status",
        status: "$specialties.status",
        created_at: "$specialties.created_at",
        updated_at: "$specialties.updated_at",
        distanceKm: {
          $round: [{ $divide: ["$distanceMeters", 1000] }, 2],
        },
        shop: {
          _id: "$_id",
          name: "$name",
          slug: "$slug",
          address: "$address",
          formatted_address: "$formatted_address",
          cover_image: "$cover_image",
          latitude: "$latitude",
          longitude: "$longitude",
        },
      },
    },
  ]);
};

export const getSpecialtyBySlug = async (slug, filter = {}) => {
  const specialty = await Specialty.findOne({ slug, ...filter }).lean();
  if (!specialty) return null;

  const specIdStr = specialty._id.toString();

  const products = await Product.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $toString: "$specialty_id" }, specIdStr],
        },
      },
    },

    {
      $lookup: {
        from: "shops",
        let: { pShopId: "$shop_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$pShopId"] },
                  { $eq: [{ $toString: "$_id" }, { $toString: "$$pShopId" }] },
                ],
              },
            },
          },
        ],
        as: "shop",
      },
    },
    {
      $unwind: {
        path: "$shop",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        image_url: 1,
        price: 1,
        rating: 1,
        description: 1,
        specialty_id: 1,
        shop: {
          _id: "$shop._id",
          name: "$shop.name",
          slug: "$shop.slug",
          address: "$shop.address",
          formatted_address: "$shop.formatted_address",
          latitude: "$shop.latitude",
          longitude: "$shop.longitude",
        },
      },
    },
  ]);

  return {
    ...specialty,
    products,
    totalProducts: products.length,
  };
};

export const updateSpecialty = async (id, body) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("INVALID_ID");
  }

  const specialty = await Specialty.findById(id);
  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  const updateData = { ...body };

  if (updateData.slug) {
    updateData.slug = await generateUniqueSlug(updateData.slug, id);
  } else if (updateData.name && updateData.name !== specialty.name) {
    updateData.slug = await generateUniqueSlug(updateData.name, id);
  }

  return await Specialty.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const approveSpecialty = async (id, reviewerId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("INVALID_ID");
  }

  const specialty = await Specialty.findByIdAndUpdate(
    id,
    {
      approval_status: "approved",
      rejected_reason: "",
      status: "active",
      reviewed_by: reviewerId || null,
      reviewed_at: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  return specialty;
};

export const rejectSpecialty = async (id, rejectedReason = "", reviewerId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("INVALID_ID");
  }

  const specialty = await Specialty.findByIdAndUpdate(
    id,
    {
      approval_status: "rejected",
      rejected_reason: rejectedReason,
      status: "inactive",
      reviewed_by: reviewerId || null,
      reviewed_at: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  return specialty;
};

export const deleteSpecialty = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("INVALID_ID");
  }

  const specialty = await Specialty.findById(id);
  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  const specialtyIdStr = specialty._id.toString();
  const relatedProductCount = await Product.countDocuments({
    $or: [
      { specialty_id: specialty._id },
      { specialty_id: specialtyIdStr },
    ],
  });

  if (relatedProductCount > 0) {
    throw new Error("SPECIALTY_HAS_PRODUCTS");
  }

  await SpecialtyStory.deleteOne({ specialty_id: specialty._id });
  return await Specialty.findByIdAndDelete(id);
};

export default {
  createSpecialty,
  createVendorSpecialty,
  getVendorSpecialties,
  updateVendorSpecialty,
  deleteVendorSpecialty,
  getAllSpecialties,
  getPublicSpecialties,
  getNearbySpecialties,
  getSpecialtyBySlug,
  updateSpecialty,
  approveSpecialty,
  rejectSpecialty,
  validateApprovalStatus,
  deleteSpecialty,
};
