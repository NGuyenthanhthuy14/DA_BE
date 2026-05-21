const Specialty = require("../models/SpecialtyModel");
const Product = require("../models/ProductModel");
const mongoose = require("mongoose");


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

module.exports = {
  getAllSpecialties,
  getSpecialtyBySlug,
};
