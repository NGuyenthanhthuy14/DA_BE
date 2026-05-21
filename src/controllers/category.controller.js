import categoryService from "../services/category.service";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      err: 0,
      mess: "Get categories successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting categories",
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        err: 1,
        mess: "Category not found",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Get category detail successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Server error when getting category detail",
    });
  }
};
