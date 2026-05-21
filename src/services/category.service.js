import Category from "../models/CategoryModel";
import Product from "../models/ProductModel";
import Shop from "../models/shop.model";
import slugify from "slugify";

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];

const makeSlug = (name) => slugify(name, { lower: true, strict: true, locale: "vi" });

const getVendorShopOrThrow = async (ownerId) => {
  const shop = await Shop.findOne({ owner_id: String(ownerId) });
  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  return shop;
};

const buildCategoryData = (data) => {
  let slug = data.slug;
  if (!slug && data.name) {
    slug = makeSlug(data.name);
  }
  if (!slug) {
    slug = Date.now().toString();
  }

  return {
    ...data,
    slug,
  };
};

export const getAllCategories = async (filter = {}) => {
  return await Category.find(filter).sort({ created_at: -1 }).lean();
};

export const getPublicCategories = async () => {
  return await getAllCategories({
    status: "active",
    approval_status: "approved",
  });
};

export const getCategoryBySlug = async (slug, filter = {}) => {
  return await Category.findOne({ slug, ...filter }).lean();
};

export const createCategory = async (data) => {
  const category = new Category(
    buildCategoryData({
      ...data,
      approval_status: data.approval_status || "approved",
    })
  );

  return await category.save();
};

export const createVendorCategory = async (ownerId, data) => {
  const shop = await getVendorShopOrThrow(ownerId);
  const category = new Category(
    buildCategoryData({
      name: data.name,
      description: data.description || "",
      image_url: data.image_url || "",
      status: "active",
      approval_status: "pending",
      rejected_reason: "",
      created_by: ownerId,
      shop_id: shop._id,
    })
  );

  return await category.save();
};

export const updateCategory = async (id, data) => {
  const updateData = { ...data };
  if (updateData.name && !updateData.slug) {
    updateData.slug = makeSlug(updateData.name);
  }

  return await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const approveCategory = async (id) => {
  return await Category.findByIdAndUpdate(
    id,
    {
      approval_status: "approved",
      rejected_reason: "",
      status: "active",
    },
    { new: true, runValidators: true }
  );
};

export const rejectCategory = async (id, rejectedReason = "") => {
  return await Category.findByIdAndUpdate(
    id,
    {
      approval_status: "rejected",
      rejected_reason: rejectedReason,
    },
    { new: true, runValidators: true }
  );
};

export const validateApprovalStatus = (approvalStatus) => {
  return !approvalStatus || APPROVAL_STATUSES.includes(approvalStatus);
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    return null;
  }

  const productCount = await Product.countDocuments({
    category_id: { $in: [id, String(id), category._id, String(category._id)] },
  });

  if (productCount > 0) {
    const inactiveCategory = await Category.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true, runValidators: true }
    );

    return {
      category: inactiveCategory,
      deleted: false,
      softDeleted: true,
      productCount,
    };
  }

  const deletedCategory = await Category.findByIdAndDelete(id);
  return {
    category: deletedCategory,
    deleted: true,
    softDeleted: false,
    productCount: 0,
  };
};

export default {
  getAllCategories,
  getPublicCategories,
  getCategoryBySlug,
  createCategory,
  createVendorCategory,
  updateCategory,
  approveCategory,
  rejectCategory,
  validateApprovalStatus,
  deleteCategory,
};
