const Shop = require("../models/shop.model");
const { makeSlug } = require("../utils/slugify.util");

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

module.exports = {
  createShop,
  getAllShops,
  getShopBySlug,
  getShopById,
  updateShop,
  getNearbyShops,
};