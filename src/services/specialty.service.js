const Specialty = require("../models/SpecialtyModel");
const Product = require("../models/ProductModel");
const { makeSlug } = require("../utils/slugify.util");
const mongoose = require("mongoose");

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

const createSpecialty = async (body) => {
  const { category_id, name, description, image_url, slug } = body;

  if (!name) {
    throw new Error("NAME_REQUIRED");
  }

  if (!category_id) {
    throw new Error("CATEGORY_REQUIRED");
  }

  const newSlug = await generateUniqueSlug(slug || name);

  return await Specialty.create({
    category_id,
    name,
    slug: newSlug,
    description: description || "",
    image_url: image_url || "",
  });
};

const getAllSpecialties = async () => {
  return await Specialty.find().sort({ created_at: -1 }).lean();
};


const getSpecialtyBySlug = async (slug) => {
  const specialty = await Specialty.findOne({ slug }).lean();
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
        discount: 1,
        sold: 1,
        countInStock: 1,
        category_id: 1,
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

const updateSpecialty = async (id, body) => {
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

const deleteSpecialty = async (id) => {
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

  return await Specialty.findByIdAndDelete(id);
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyBySlug,
  updateSpecialty,
  deleteSpecialty,
};
