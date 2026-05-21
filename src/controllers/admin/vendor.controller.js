import vendorService from "../../services/vendor.service";

export const getAllVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const response = await vendorService.getAllVendorsService(status);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const getVendorDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "vendor id is required",
      });
    }

    const response = await vendorService.getVendorDetailService(id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "vendor id is required",
      });
    }

    const response = await vendorService.updateVendorService(id, req.body);
    return res.status(response.err ? 400 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "vendor id is required",
      });
    }

    const response = await vendorService.approveVendorService(id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};

export const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        err: 1,
        mess: "vendor id is required",
      });
    }

    const response = await vendorService.rejectVendorService(id);
    return res.status(response.err ? 404 : 200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: 1,
      mess: error.message || "Server error",
    });
  }
};
