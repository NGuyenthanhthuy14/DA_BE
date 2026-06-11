import mongoose from "mongoose";
import Specialty from "../models/SpecialtyModel";
import SpecialtyStory from "../models/SpecialtyStoryModel";
import Shop from "../models/shop.model";
import { makeSlug } from "../utils/slugify.util";

const STORY_STATUSES = ["draft", "published", "archived"];
const STORY_COLLECTION = SpecialtyStory.collection.name;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = makeSlug(title) || Date.now().toString();
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await SpecialtyStory.findOne(query).lean();
    if (!existing) break;

    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

const sanitizeStoryPayload = (body, currentStory = null) => {
  const data = {};

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    data.title = body.title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "summary")) {
    data.summary = body.summary || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "content")) {
    data.content = body.content;
  }

  if (Object.prototype.hasOwnProperty.call(body, "cover_image_url")) {
    data.cover_image_url = body.cover_image_url || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "images")) {
    data.images = Array.isArray(body.images) ? body.images : [];
  }

  if (Object.prototype.hasOwnProperty.call(body, "tags")) {
    data.tags = Array.isArray(body.tags) ? body.tags : [];
  }

  if (Object.prototype.hasOwnProperty.call(body, "seo_title")) {
    data.seo_title = body.seo_title || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "seo_description")) {
    data.seo_description = body.seo_description || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!STORY_STATUSES.includes(body.status)) {
      throw new Error("INVALID_STATUS");
    }
    data.status = body.status;

    if (body.status === "published" && !currentStory?.published_at) {
      data.published_at = new Date();
    }

    if (body.status !== "published") {
      data.published_at = null;
    }
  }

  return data;
};

export const validateStoryStatus = (status) => {
  return !status || STORY_STATUSES.includes(status);
};

export const createSpecialtyStory = async (body, authorId = null) => {
  const { specialty_id, title, content, slug } = body;

  if (!specialty_id || !isValidObjectId(specialty_id)) {
    throw new Error("INVALID_SPECIALTY_ID");
  }

  if (!title) {
    throw new Error("TITLE_REQUIRED");
  }

  if (!content) {
    throw new Error("CONTENT_REQUIRED");
  }

  const specialty = await Specialty.findById(specialty_id).lean();
  if (!specialty) {
    throw new Error("SPECIALTY_NOT_FOUND");
  }

  const existingStory = await SpecialtyStory.findOne({ specialty_id }).lean();
  if (existingStory) {
    throw new Error("STORY_ALREADY_EXISTS");
  }

  const data = sanitizeStoryPayload(body);
  const status = data.status || "draft";

  return await SpecialtyStory.create({
    ...data,
    specialty_id,
    title,
    content,
    slug: await generateUniqueSlug(slug || title),
    author_id: authorId || null,
    status,
    published_at: status === "published" ? new Date() : null,
  });
};

export const getAllSpecialtyStories = async (filter = {}) => {
  if (filter.specialty_id && !isValidObjectId(filter.specialty_id)) {
    throw new Error("INVALID_SPECIALTY_ID");
  }

  return await SpecialtyStory.find(filter)
    .populate("specialty_id", "name slug image_url status approval_status")
    .sort({ created_at: -1 })
    .lean();
};

export const getSpecialtyStoryById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("INVALID_ID");
  }

  return await SpecialtyStory.findById(id)
    .populate("specialty_id", "name slug image_url status approval_status")
    .lean();
};

export const getSpecialtyStoryBySlug = async (slug, filter = {}) => {
  return await SpecialtyStory.findOne({ slug, ...filter })
    .populate("specialty_id", "name slug image_url status approval_status")
    .lean();
};

export const getPublishedStoryBySpecialtySlug = async (specialtySlug) => {
  const specialty = await Specialty.findOne({
    slug: specialtySlug,
    status: "active",
    approval_status: "approved",
  }).lean();

  if (!specialty) {
    return null;
  }

  const story = await SpecialtyStory.findOne({
    specialty_id: specialty._id,
    status: "published",
  }).lean();

  if (!story) {
    return null;
  }

  return {
    ...story,
    specialty,
  };
};

export const getNearbyPublishedSpecialtyStories = async (lat, lng, maxKm = 20, limit = 20) => {
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
      $lookup: {
        from: STORY_COLLECTION,
        let: { specialtyId: "$specialties._id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$specialty_id", "$$specialtyId"] },
              status: "published",
            },
          },
        ],
        as: "story",
      },
    },
    {
      $unwind: {
        path: "$story",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        distanceMeters: 1,
        "story.published_at": -1,
        "story.created_at": -1,
      },
    },
    {
      $limit: resultLimit,
    },
    {
      $project: {
        _id: "$story._id",
        specialty_id: "$story.specialty_id",
        title: "$story.title",
        slug: "$story.slug",
        summary: "$story.summary",
        content: "$story.content",
        cover_image_url: "$story.cover_image_url",
        images: "$story.images",
        tags: "$story.tags",
        author_id: "$story.author_id",
        status: "$story.status",
        published_at: "$story.published_at",
        seo_title: "$story.seo_title",
        seo_description: "$story.seo_description",
        view_count: "$story.view_count",
        created_at: "$story.created_at",
        updated_at: "$story.updated_at",
        distanceKm: {
          $round: [{ $divide: ["$distanceMeters", 1000] }, 2],
        },
        specialty: {
          _id: "$specialties._id",
          name: "$specialties.name",
          slug: "$specialties.slug",
          description: "$specialties.description",
          image_url: "$specialties.image_url",
          status: "$specialties.status",
          approval_status: "$specialties.approval_status",
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

export const updateSpecialtyStory = async (id, body) => {
  if (!isValidObjectId(id)) {
    throw new Error("INVALID_ID");
  }

  const story = await SpecialtyStory.findById(id);
  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  const data = sanitizeStoryPayload(body, story);

  if (Object.prototype.hasOwnProperty.call(body, "specialty_id")) {
    if (!body.specialty_id || !isValidObjectId(body.specialty_id)) {
      throw new Error("INVALID_SPECIALTY_ID");
    }

    const specialty = await Specialty.findById(body.specialty_id).lean();
    if (!specialty) {
      throw new Error("SPECIALTY_NOT_FOUND");
    }

    const existingStory = await SpecialtyStory.findOne({
      specialty_id: body.specialty_id,
      _id: { $ne: id },
    }).lean();

    if (existingStory) {
      throw new Error("STORY_ALREADY_EXISTS");
    }

    data.specialty_id = body.specialty_id;
  }

  if (Object.prototype.hasOwnProperty.call(body, "slug")) {
    data.slug = await generateUniqueSlug(body.slug || body.title || story.title, id);
  } else if (body.title && body.title !== story.title) {
    data.slug = await generateUniqueSlug(body.title, id);
  }

  return await SpecialtyStory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const publishSpecialtyStory = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("INVALID_ID");
  }

  const story = await SpecialtyStory.findByIdAndUpdate(
    id,
    {
      status: "published",
      published_at: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  return story;
};

export const archiveSpecialtyStory = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("INVALID_ID");
  }

  const story = await SpecialtyStory.findByIdAndUpdate(
    id,
    {
      status: "archived",
      published_at: null,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  return story;
};

export const deleteSpecialtyStory = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("INVALID_ID");
  }

  const story = await SpecialtyStory.findByIdAndDelete(id);
  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  return story;
};

export default {
  validateStoryStatus,
  createSpecialtyStory,
  getAllSpecialtyStories,
  getSpecialtyStoryById,
  getSpecialtyStoryBySlug,
  getPublishedStoryBySpecialtySlug,
  getNearbyPublishedSpecialtyStories,
  updateSpecialtyStory,
  publishSpecialtyStory,
  archiveSpecialtyStory,
  deleteSpecialtyStory,
};
