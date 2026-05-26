import Shop from "../models/shop.model";
import Product from "../models/ProductModel";
import { makeSlug } from "../utils/slugify.util";
import { buildGeohashPrefixRegexes, encodeGeohash } from "../utils/geohash.util";
import mongoose from "mongoose";

const generateUniqueSlug = async (name) => {
  const baseSlug = makeSlug(name);
  let slug = baseSlug;
  let count = 1;

  while (await Shop.findOne({ slug })) {
    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

export const createShop = async (body) => {
  const {
    owner_id,
    name,
    description,
    phone,
    cover_image,
    latitude,
    longitude,
    address,
    formatted_address,
    province_id,
    district_id,
    ward_code,
    status,
  } = body;

  const slug = await generateUniqueSlug(name);

  const newShop = await Shop.create({
    owner_id,
    name,
    slug,
    description: description || "",
    phone: phone || "",
    cover_image: cover_image || "",
    latitude,
    longitude,
    geohash: encodeGeohash(latitude, longitude),
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    address: address || "",
    formatted_address: formatted_address || "",
    province_id: province_id ?? null,
    district_id: district_id ?? null,
    ward_code: ward_code || "",
    status: status || "active",
  });

  return newShop;
};

export const getAllShops = async (filter = {}) => {
  return await Shop.find(filter).sort({ created_at: -1 }).lean();
};

export const getShopBySlug = async (slug) => {
  return await Shop.findOne({ slug });
};

export const getShopById = async (id) => {
  return await Shop.findById(id);
};

export const getShopByOwnerId = async (ownerId) => {
  return await Shop.findOne({ owner_id: String(ownerId) });
};

export const getShopProduct = async (shopId, { activeOnly = false } = {}) => {
  let shop;
  if (mongoose.Types.ObjectId.isValid(shopId)) {
    shop = await Shop.findOne({
      $or: [{ _id: shopId }, { owner_id: shopId }],
    });
  } else {
    shop = await Shop.findOne({ owner_id: shopId });
  }

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  if (activeOnly && shop.status !== "active") {
    throw new Error("SHOP_NOT_FOUND");
  }

  const products = await Product.find({
    $or: [
      { shop_id: shop._id },
      { shop_id: new mongoose.Types.ObjectId(shop._id) },
      { shop_id: shopId } 
    ],
  }).sort({ created_at: -1 });

  return products;
};

export const updateShop = async (id, body) => {
  const shop = await Shop.findById(id);
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  const updateData = { ...body };

  if (body.name && body.name !== shop.name) {
    updateData.slug = await generateUniqueSlug(body.name);
  }

  if (
    body.latitude !== undefined &&
    body.longitude !== undefined
  ) {
    updateData.geohash = encodeGeohash(body.latitude, body.longitude);
    updateData.location = {
      type: "Point",
      coordinates: [body.longitude, body.latitude],
    };
  }

  const updatedShop = await Shop.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedShop;
};

export const updateVendorShop = async (ownerId, body) => {
  const shop = await getShopByOwnerId(ownerId);
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return updateShop(shop._id, body);
};

export const blockShop = async (id, { reason, blocked_by }) => {
  const shop = await Shop.findByIdAndUpdate(
    id,
    {
      status: "inactive",
      block_reason: reason,
      blocked_at: new Date(),
      blocked_by: blocked_by || "",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!shop) throw new Error("SHOP_NOT_FOUND");
  return shop;
};

export const getNearbyShops = async ({ lat, lng, maxDistance = 2000 }) => {
  const radiusKm = maxDistance / 1000;
  const geohashRegexes = buildGeohashPrefixRegexes(lat, lng, radiusKm);

  return await Shop.find({
    status: "active",
    $or: [{ geohash: { $in: geohashRegexes } }, { geohash: { $in: ["", null] } }],
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

export const getShopsWithSpecialties = async ({ lat, lng } = {}) => {
  const hasLocation =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);

  return await Shop.aggregate([
    ...(hasLocation
      ? [
          {
            $match: {
              status: "active",
              $or: [
                { geohash: { $in: buildGeohashPrefixRegexes(lat, lng, 20) } },
                { geohash: { $in: ["", null] } },
              ],
            },
          },
          {
            $addFields: {
              distanceKm: {
                $round: [
                  {
                    $multiply: [
                      {
                        $sqrt: {
                          $add: [
                            {
                              $pow: [
                                {
                                  $subtract: ["$longitude", lng],
                                },
                                2,
                              ],
                            },
                            {
                              $pow: [
                                {
                                  $subtract: ["$latitude", lat],
                                },
                                2,
                              ],
                            },
                          ],
                        },
                      },
                      111,
                    ],
                  },
                  2,
                ],
              },
            },
          },
          {
            $match: {
              distanceKm: { $lte: 20 },
            },
          },
        ]
      : []),

    {
      $lookup: {
        from: "shop_specialties",
        localField: "_id",
        foreignField: "shop_id",
        as: "shop_specs",
      },
    },
    {
      $lookup: {
        from: "specialties",
        let: { specialtyIds: { $ifNull: ["$shop_specs.specialty_id", []] } },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$specialtyIds"] },
              status: "active",
              approval_status: "approved",
            },
          },
        ],
        as: "specialties",
      },
    },
    {
      $project: {
        _id: 0,
        idShop: "$_id",
        name: 1,
        slug: 1,
        address: 1,
        formatted_address: 1,
        cover_image: 1,
        phone: 1,
        latitude: 1,
        longitude: 1,
        status: 1,
        distanceKm: hasLocation ? 1 : "$$REMOVE",

        specialties: {
          $map: {
            input: "$specialties",
            as: "sp",
            in: {
              idSpecialties: "$$sp._id",
              name: "$$sp.name",
              slug: "$$sp.slug",
              description: "$$sp.description",
              image_url: "$$sp.image_url",
              is_featured: {
                $ifNull: [
                  {
                    $let: {
                      vars: {
                        matchedSpec: {
                          $first: {
                            $filter: {
                              input: "$shop_specs",
                              as: "ss",
                              cond: {
                                $eq: ["$$ss.specialty_id", "$$sp._id"],
                              },
                            },
                          },
                        },
                      },
                      in: "$$matchedSpec.is_featured",
                    },
                  },
                  false,
                ],
              },
            },
          },
        },
      },
    },
    {
      $sort: hasLocation ? { distanceKm: 1 } : { name: 1 },
    },
  ]);
};

export const deleteShop = async (id) => {
  const shop = await Shop.findByIdAndDelete(id);
  if (!shop) throw new Error("SHOP_NOT_FOUND");
  return shop;
};

export const deleteVendorShop = async (ownerId) => {
  const shop = await Shop.findOneAndDelete({ owner_id: String(ownerId) });
  if (!shop) throw new Error("SHOP_NOT_FOUND");
  return shop;
};

export const backfillShopGeohashes = async () => {
  const shops = await Shop.find({
    $or: [{ geohash: { $exists: false } }, { geohash: { $in: ["", null] } }],
    latitude: { $type: "number" },
    longitude: { $type: "number" },
  });

  const updates = await Promise.all(
    shops.map((shop) => {
      shop.geohash = encodeGeohash(shop.latitude, shop.longitude);
      return shop.save();
    })
  );

  return {
    matched: shops.length,
    updated: updates.length,
  };
};

export default {
  createShop,
  getAllShops,
  getShopBySlug,
  getShopById,
  getShopByOwnerId,
  getShopProduct,
  updateShop,
  updateVendorShop,
  blockShop,
  deleteShop,
  deleteVendorShop,
  backfillShopGeohashes,
  getNearbyShops,
  getShopsWithSpecialties,
};
