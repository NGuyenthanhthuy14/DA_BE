import https from "https";
import mongoose from "mongoose";
import Shop from "../models/shop.model";

const GHN_DEV_URL = "https://dev-online-gateway.ghn.vn";
const GHN_PRODUCTION_URL = "https://online-gateway.ghn.vn";

const getGhnConfig = ({ requireShopId = true } = {}) => {
  const token = process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
  const isProduction = process.env.GHN_ENV === "production";
  const baseUrl =
    process.env.GHN_BASE_URL || (isProduction ? GHN_PRODUCTION_URL : GHN_DEV_URL);

  if (!token || (requireShopId && !shopId)) {
    throw new Error("GHN_CONFIG_MISSING");
  }

  return { token, shopId, baseUrl };
};

const requestJson = (url, { method = "POST", headers = {}, body } = {}) =>
  new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (payload) {
      requestHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const request = https.request(
      url,
      {
        method,
        headers: requestHeaders,
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          try {
            const parsedBody = responseBody ? JSON.parse(responseBody) : null;
            resolve({
              statusCode: response.statusCode,
              body: parsedBody,
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });

const postJson = (url, headers, body) =>
  requestJson(url, { method: "POST", headers, body });

const buildGhnResponse = (ghnResponse, successMessage, failureMessage) => {
  const isSuccess =
    ghnResponse.statusCode >= 200 &&
    ghnResponse.statusCode < 300 &&
    ghnResponse.body?.code === 200;

  return {
    err: isSuccess ? 0 : 1,
    mess: isSuccess
      ? successMessage
      : ghnResponse.body?.message || failureMessage,
    data: ghnResponse.body?.data || null,
    ghn: {
      code: ghnResponse.body?.code,
      message: ghnResponse.body?.message,
    },
  };
};

const normalizePackage = (data) => ({
  length: Number(data.length || 20),
  width: Number(data.width || 20),
  height: Number(data.height || 10),
  weight: Number(data.weight || 500),
});

const isEmpty = (value) => value === undefined || value === null || value === "";

const getShopIdFromPayload = (data) => data.shopid || data.shop_id || data.shopId;

const findShopForShipping = async (shopId) => {
  if (mongoose.Types.ObjectId.isValid(shopId)) {
    return Shop.findOne({
      $or: [{ _id: shopId }, { owner_id: String(shopId) }],
    }).lean();
  }

  return Shop.findOne({ owner_id: String(shopId) }).lean();
};

const isGhnTestProvince = (province) =>
  province?.ProvinceID === 298 ||
  province?.ProvinceID === 2002 ||
  String(province?.ProvinceName || "").startsWith("Test - Alert - Tỉnh");

const hasBrokenText = (value) => /�|Ã|Ä|Â|áº|á»/.test(String(value || ""));

const isTestName = (value) => /\btest\b/i.test(String(value || ""));

const getFirstValidNameExtension = (nameExtension = []) =>
  (Array.isArray(nameExtension) ? nameExtension : []).find(
    (name) => name && !hasBrokenText(name) && !isTestName(name)
  );

const normalizeGhnDistrict = (district) => {
  const districtName = String(district?.DistrictName || "");
  const nameFromExtension = getFirstValidNameExtension(district?.NameExtension);

  return {
    ...district,
    DistrictName:
      nameFromExtension ||
      (!hasBrokenText(districtName) && !isTestName(districtName)
        ? districtName
        : ""),
  };
};

const isValidGhnDistrict = (district) =>
  !isTestName(district?.DistrictName) &&
  Boolean(normalizeGhnDistrict(district).DistrictName);

export const calculateShippingFeeService = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const { token, shopId, baseUrl } = getGhnConfig();
      const requiredFields = [
        "from_district_id",
        "from_ward_code",
      ];
      const missingField = requiredFields.find((field) => isEmpty(data[field]));

      if (missingField) {
        resolve({
          err: 1,
          mess: `${missingField} is required`,
          data: null,
        });
        return;
      }

      let toDistrictId = data.to_district_id;
      let toWardCode = data.to_ward_code;
      const payloadShopId = getShopIdFromPayload(data);

      if (!isEmpty(payloadShopId)) {
        const shop = await findShopForShipping(payloadShopId);

        if (!shop) {
          resolve({
            err: 1,
            mess: "shop not found",
            data: null,
          });
          return;
        }

        if (isEmpty(shop.district_id) || isEmpty(shop.ward_code)) {
          resolve({
            err: 1,
            mess: "shop shipping address is missing district_id or ward_code",
            data: null,
          });
          return;
        }

        toDistrictId = shop.district_id;
        toWardCode = shop.ward_code;
      }

      if (isEmpty(toDistrictId) || isEmpty(toWardCode)) {
        resolve({
          err: 1,
          mess: "shopid is required",
          data: null,
        });
        return;
      }

      const packageInfo = normalizePackage(data);
      const requestBody = {
        service_type_id: Number(data.service_type_id || 2),
        from_district_id: Number(data.from_district_id),
        from_ward_code: String(data.from_ward_code),
        to_district_id: Number(toDistrictId),
        to_ward_code: String(toWardCode),
        ...packageInfo,
        insurance_value: Number(data.insurance_value || 0),
        coupon: data.coupon || null,
        items: Array.isArray(data.items) && data.items.length > 0
          ? data.items.map((item) => ({
              name: item.name || "Product",
              quantity: Number(item.quantity || 1),
              length: Number(item.length || packageInfo.length),
              width: Number(item.width || packageInfo.width),
              height: Number(item.height || packageInfo.height),
              weight: Number(item.weight || packageInfo.weight),
            }))
          : [
              {
                name: "Product",
                quantity: 1,
                ...packageInfo,
              },
            ],
      };

      const ghnResponse = await postJson(
        `${baseUrl}/shiip/public-api/v2/shipping-order/fee`,
        {
          Token: token,
          ShopId: shopId,
        },
        requestBody
      );

      resolve(buildGhnResponse(
        ghnResponse,
        "Tinh phi van chuyen thanh cong",
        "Tinh phi van chuyen that bai"
      ));
    } catch (error) {
      reject(error);
    }
  });

export const getProvincesService = async () => {
  const { token, baseUrl } = getGhnConfig({ requireShopId: false });
  const ghnResponse = await requestJson(
    `${baseUrl}/shiip/public-api/master-data/province`,
    {
      method: "GET",
      headers: {
        Token: token,
      },
    }
  );

  const response = buildGhnResponse(
    ghnResponse,
    "Lay danh sach tinh/thanh pho thanh cong",
    "Lay danh sach tinh/thanh pho that bai"
  );

  if (Array.isArray(response.data)) {
    response.data = response.data.filter((province) => !isGhnTestProvince(province));
  }

  return response;
};

export const getDistrictsService = async ({ province_id }) => {
  if (province_id === undefined || province_id === null || province_id === "") {
    return {
      err: 1,
      mess: "province_id is required",
      data: null,
    };
  }

  const { token, baseUrl } = getGhnConfig({ requireShopId: false });
  const ghnResponse = await postJson(
    `${baseUrl}/shiip/public-api/master-data/district`,
    {
      Token: token,
    },
    {
      province_id: Number(province_id),
    }
  );

  const response = buildGhnResponse(
    ghnResponse,
    "Lay danh sach quan/huyen thanh cong",
    "Lay danh sach quan/huyen that bai"
  );

  if (Array.isArray(response.data)) {
    response.data = response.data
      .filter(isValidGhnDistrict)
      .map(normalizeGhnDistrict);
  }

  return response;
};

export const getWardsService = async ({ district_id }) => {
  if (district_id === undefined || district_id === null || district_id === "") {
    return {
      err: 1,
      mess: "district_id is required",
      data: null,
    };
  }

  const { token, baseUrl } = getGhnConfig({ requireShopId: false });
  const ghnResponse = await postJson(
    `${baseUrl}/shiip/public-api/master-data/ward`,
    {
      Token: token,
    },
    {
      district_id: Number(district_id),
    }
  );

  return buildGhnResponse(
    ghnResponse,
    "Lay danh sach phuong/xa thanh cong",
    "Lay danh sach phuong/xa that bai"
  );
};
