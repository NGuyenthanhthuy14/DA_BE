const categoryService = require("../services/category.service");

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      err: 0,
      mess: "Lấy danh sách danh mục thành công",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: 1,
      mess: "Lỗi server khi lấy danh sách danh mục",
    });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        err: 1,
        mess: "Không tìm thấy danh mục",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Lấy chi tiết danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: 1,
      mess: "Lỗi server khi lấy chi tiết danh mục",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        err: 1,
        mess: "Tên danh mục là bắt buộc",
      });
    }

    const newCategory = await categoryService.createCategory(req.body);
    return res.status(201).json({
      err: 0,
      mess: "Tạo danh mục thành công",
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        err: 1,
        mess: "Tên hoặc slug danh mục đã tồn tại",
      });
    }
    return res.status(500).json({
      err: 1,
      mess: "Lỗi server khi tạo danh mục",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await categoryService.updateCategory(id, req.body);
    
    if (!updatedCategory) {
      return res.status(404).json({
        err: 1,
        mess: "Không tìm thấy danh mục để cập nhật",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        err: 1,
        mess: "Tên hoặc slug danh mục đã tồn tại",
      });
    }
    return res.status(500).json({
      err: 1,
      mess: "Lỗi server khi cập nhật danh mục",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryService.deleteCategory(id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        err: 1,
        mess: "Không tìm thấy danh mục để xóa",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: 1,
      mess: "Lỗi server khi xóa danh mục",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
