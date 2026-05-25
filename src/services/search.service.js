import slugify from "slugify";
import db from "../models";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePagination = (limit = 10, page = 1) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);

  return {
    limit: safeLimit,
    page: safePage,
    skip: safeLimit * (safePage - 1),
  };
};

const getKeywordMatchers = (keyword) => {
  const trimmedKeyword = keyword.trim();
  const keywordRegex = escapeRegex(trimmedKeyword);
  const keywordSlug = slugify(trimmedKeyword, {
    lower: true,
    strict: true,
    locale: "vi",
  });
  const slugRegex = escapeRegex(keywordSlug || trimmedKeyword.toLowerCase());

  return {
    keywordRegex,
    slugRegex,
    match: {
      $or: [
        { name: { $regex: keywordRegex, $options: "i" } },
        { slug: { $regex: slugRegex, $options: "i" } },
      ],
    },
  };
};

const relevanceFields = (keywordRegex, slugRegex) => ({
  relevanceScore: {
    $switch: {
      branches: [
        {
          case: { $regexMatch: { input: "$name", regex: `^${keywordRegex}$`, options: "i" } },
          then: 100,
        },
        {
          case: { $regexMatch: { input: "$name", regex: `^${keywordRegex}`, options: "i" } },
          then: 80,
        },
        {
          case: { $regexMatch: { input: "$slug", regex: `^${slugRegex}`, options: "i" } },
          then: 70,
        },
        {
          case: { $regexMatch: { input: "$name", regex: keywordRegex, options: "i" } },
          then: 50,
        },
      ],
      default: 10,
    },
  },
});

const searchShops = async (keyword, limit, page) => {
  const { limit: safeLimit, page: safePage, skip } = normalizePagination(limit, page);
  const { keywordRegex, slugRegex, match } = getKeywordMatchers(keyword);
  const query = { status: "active", ...match };

  const [data, total] = await Promise.all([
    db.Shops.aggregate([
      { $match: query },
      { $addFields: relevanceFields(keywordRegex, slugRegex) },
      { $sort: { relevanceScore: -1, name: 1 } },
      { $skip: skip },
      { $limit: safeLimit },
      {
        $project: {
          relevanceScore: 0,
          __v: 0,
        },
      },
    ]),
    db.Shops.countDocuments(query),
  ]);

  return {
    data,
    total,
    currentPage: safePage,
    totalPage: Math.ceil(total / safeLimit),
    limit: safeLimit,
  };
};

const searchProducts = async (keyword, limit, page) => {
  const { limit: safeLimit, page: safePage, skip } = normalizePagination(limit, page);
  const { keywordRegex, slugRegex, match } = getKeywordMatchers(keyword);

  const pipeline = [
    { $match: match },
    { $addFields: relevanceFields(keywordRegex, slugRegex) },
    {
      $lookup: {
        from: "shops",
        let: { productShopId: "$shop_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$productShopId"] },
                  { $eq: [{ $toString: "$_id" }, { $toString: "$$productShopId" }] },
                  { $eq: ["$id", "$$productShopId"] },
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
      $match: {
        $or: [{ "shop.status": "active" }, { shop_id: null }],
      },
    },
  ];

  const [data, totalResult] = await Promise.all([
    db.Product.aggregate([
      ...pipeline,
      { $sort: { relevanceScore: -1, name: 1 } },
      { $skip: skip },
      { $limit: safeLimit },
      {
        $project: {
          _id: 1,
          shop_id: 1,
          specialty_id: 1,
          name: 1,
          slug: 1,
          image_url: 1,
          price: 1,
          description: 1,
          countInStock: 1,
          rating: 1,
          sold: 1,
          discount: 1,
          created_at: 1,
          updated_at: 1,
          shop: {
            _id: "$shop._id",
            name: "$shop.name",
            slug: "$shop.slug",
            address: "$shop.address",
            formatted_address: "$shop.formatted_address",
            cover_image: "$shop.cover_image",
          },
        },
      },
    ]),
    db.Product.aggregate([...pipeline, { $count: "total" }]),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    data,
    total,
    currentPage: safePage,
    totalPage: Math.ceil(total / safeLimit),
    limit: safeLimit,
  };
};

export const searchAllService = async ({
  keyword,
  shopLimit = 2,
  productLimit = 10,
  shopPage = 1,
  productPage = 1,
}) => {
  if (!keyword?.trim()) {
    return {
      err: 1,
      mess: "keyword is required",
      data: null,
    };
  }

  const [shops, products] = await Promise.all([
    searchShops(keyword, shopLimit, shopPage),
    searchProducts(keyword, productLimit, productPage),
  ]);

  return {
    err: 0,
    mess: "Tim kiem thanh cong",
    data: {
      keyword: keyword.trim(),
      shops,
      products,
    },
  };
};

export const searchShopsService = async ({ keyword, limit = 10, page = 1 }) => {
  if (!keyword?.trim()) {
    return {
      err: 1,
      mess: "keyword is required",
      data: null,
    };
  }

  const shops = await searchShops(keyword, limit, page);

  return {
    err: 0,
    mess: "Tim kiem shop thanh cong",
    data: {
      keyword: keyword.trim(),
      shops,
    },
  };
};
