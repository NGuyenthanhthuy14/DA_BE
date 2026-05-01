const Shop = require("../models/shop.model");
const Product = require("../models/ProductModel");
const { makeSlug } = require("../utils/slugify.util");
const mongoose = require("mongoose");

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

const createShop = async (body) => {
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
    status,
  } = body;

  const existedOwnerShop = await Shop.findOne({ owner_id });
  if (existedOwnerShop) {
    throw new Error("OWNER_ALREADY_HAS_SHOP");
  }

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
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    address: address || "",
    formatted_address: formatted_address || "",
    status: status || "active",
  });

  return newShop;
};

const getAllShops = async () => {
  return await Shop.find().sort({ created_at: -1 }).lean();
};

const getShopBySlug = async (slug) => {
  return await Shop.findOne({ slug });
};

const getShopById = async (id) => {
  return await Shop.findById(id);
};

const getShopProduct = async (shopId) => {
  const shop = await Shop.findById(shopId);

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  const products = await Product.find({
    $or: [
      { shop_id: shopId },
      { shop_id: new mongoose.Types.ObjectId(shopId) },
    ],
  }).sort({ created_at: -1 });

  return products;
};

module.exports = {
  getShopProduct,
};

const updateShop = async (id, body) => {
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

const getNearbyShops = async ({ lat, lng, maxDistance = 2000 }) => {
  return await Shop.find({
    status: "active",
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

const getShopsWithSpecialties = async ({ lat, lng } = {}) => {
  const hasLocation =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);

  return await Shop.aggregate([
    ...(hasLocation
      ? [
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
        localField: "shop_specs.specialty_id",
        foreignField: "_id",
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
              category_id: "$$sp.category_id",
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

module.exports = {
  createShop,
  getAllShops,
  getShopBySlug,
  getShopById,
  getShopProduct,
  updateShop,
  getNearbyShops,
  getShopsWithSpecialties,
};
