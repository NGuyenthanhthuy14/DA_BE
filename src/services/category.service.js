const Category = require("../models/CategoryModel");
const slugify = require("slugify");

const getAllCategories = async () => {
  return await Category.find().sort({ created_at: -1 }).lean();
};

const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug }).lean();
};

const createCategory = async (data) => {
  let slug = data.slug;
  if (!slug && data.name) {
    slug = slugify(data.name, { lower: true, strict: true, locale: 'vi' });
  }
  if (!slug) {
    slug = Date.now().toString();
  }

  const category = new Category({
    ...data,
    slug,
  });

  return await category.save();
};

const updateCategory = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name, { lower: true, strict: true, locale: 'vi' });
  }
  
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
