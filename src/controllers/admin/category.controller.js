import categoryService from "../../services/category.service";

export const getAllCategories = async (req, res) => {
  try {
    const { approval_status, status } = req.query;
    if (!categoryService.validateApprovalStatus(approval_status)) {
      return res.status(400).json({
        err: 1,
        mess: "Trang thai duyet danh muc khong hop le",
      });
    }

    const filter = {};
    if (approval_status) filter.approval_status = approval_status;
    if (status) filter.status = status;

    const categories = await categoryService.getAllCategories(filter);
    return res.status(200).json({
      err: 0,
      mess: "Lay danh sach danh muc thanh cong",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Loi server khi lay danh sach danh muc",
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
        mess: "Khong tim thay danh muc",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Lay chi tiet danh muc thanh cong",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Loi server khi lay chi tiet danh muc",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        err: 1,
        mess: "Ten danh muc la bat buoc",
      });
    }

    const category = await categoryService.createCategory({
      ...req.body,
      approval_status: "approved",
      rejected_reason: "",
    });
    return res.status(201).json({
      err: 0,
      mess: "Tao danh muc thanh cong",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        err: 1,
        mess: "Ten hoac slug danh muc da ton tai",
      });
    }

    return res.status(500).json({
      err: 1,
      mess: "Loi server khi tao danh muc",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    if (!category) {
      return res.status(404).json({
        err: 1,
        mess: "Khong tim thay danh muc de cap nhat",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Cap nhat danh muc thanh cong",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        err: 1,
        mess: "Ten hoac slug danh muc da ton tai",
      });
    }

    return res.status(500).json({
      err: 1,
      mess: "Loi server khi cap nhat danh muc",
    });
  }
};

export const approveCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.approveCategory(id);
    if (!category) {
      return res.status(404).json({
        err: 1,
        mess: "Khong tim thay danh muc de duyet",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Duyet danh muc thanh cong",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Loi server khi duyet danh muc",
    });
  }
};

export const rejectCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_reason } = req.body;
    const category = await categoryService.rejectCategory(id, rejected_reason || "");
    if (!category) {
      return res.status(404).json({
        err: 1,
        mess: "Khong tim thay danh muc de tu choi",
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Tu choi danh muc thanh cong",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Loi server khi tu choi danh muc",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    if (!result) {
      return res.status(404).json({
        err: 1,
        mess: "Khong tim thay danh muc de xoa",
      });
    }

    if (result.softDeleted) {
      return res.status(200).json({
        err: 0,
        mess: "Danh muc dang co san pham tham chieu nen da chuyen sang inactive",
        data: result.category,
        productCount: result.productCount,
        softDeleted: true,
      });
    }

    return res.status(200).json({
      err: 0,
      mess: "Xoa danh muc thanh cong",
      data: result.category,
      softDeleted: false,
    });
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: "Loi server khi xoa danh muc",
    });
  }
};
