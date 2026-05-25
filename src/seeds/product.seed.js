require("dotenv").config();

const mongoose = require("mongoose");
const slugify = require("slugify");

const Specialty = require("../models/SpecialtyModel");
const Shop = require("../models/shop.model");
const Product = require("../models/ProductModel");
const { encodeGeohash } = require("../utils/geohash.util");

const mongoUri =
  process.env.MONGO_URI ||
  `mongodb+srv://thuy0867090536_db_user:${process.env.MONGO_DB}@cluster0.i91q99o.mongodb.net/ecomweb?retryWrites=true&w=majority&appName=Cluster0`;

const makeSlug = (value) =>
  slugify(value, { lower: true, strict: true, locale: "vi" });

const image = (seed) => `https://picsum.photos/seed/${seed}/900/700`;

const shops = [
  {
    owner_id: "mock-vendor-ha-noi",
    name: "Cua hang Dac San Ha Noi",
    description: "Chuyen dac san Ha Noi va mien Bac.",
    phone: "0901000001",
    cover_image: image("shop-dac-san-ha-noi"),
    latitude: 21.028511,
    longitude: 105.804817,
    address: "36 Hang Bong, Hoan Kiem, Ha Noi",
    formatted_address: "36 Hang Bong, Hoan Kiem, Ha Noi",
    province_id: 201,
    district_id: 1442,
    ward_code: "20308",
    specialtyNames: ["O mai Ha Noi", "Che Thai Nguyen"],
  },
  {
    owner_id: "mock-vendor-hue",
    name: "Qua Hue Xua",
    description: "Dac san Hue dong goi, giao toan quoc.",
    phone: "0901000002",
    cover_image: image("shop-qua-hue-xua"),
    latitude: 16.463713,
    longitude: 107.590866,
    address: "12 Nguyen Hue, TP Hue",
    formatted_address: "12 Nguyen Hue, TP Hue, Thua Thien Hue",
    province_id: 202,
    district_id: 1450,
    ward_code: "20501",
    specialtyNames: ["Me xung Hue"],
  },
  {
    owner_id: "mock-vendor-soc-trang",
    name: "Banh Pia Tan Hung",
    description: "Banh pia va dac san Soc Trang.",
    phone: "0901000003",
    cover_image: image("shop-banh-pia-tan-hung"),
    latitude: 9.602521,
    longitude: 105.973904,
    address: "88 Tran Hung Dao, Soc Trang",
    formatted_address: "88 Tran Hung Dao, TP Soc Trang",
    province_id: 203,
    district_id: 1460,
    ward_code: "20701",
    specialtyNames: ["Banh pia Soc Trang"],
  },
];

const specialties = [
  {
    name: "O mai Ha Noi",
    description: "O mai vi chua ngot, cay nhe, thuong dung lam qua.",
    image_url: image("o-mai-ha-noi"),
  },
  {
    name: "Che Thai Nguyen",
    description: "Tra xanh Thai Nguyen thom diu, hau vi chat nhe.",
    image_url: image("che-thai-nguyen"),
  },
  {
    name: "Me xung Hue",
    description: "Keo me xung deo thom, dac san truyen thong cua Hue.",
    image_url: image("me-xung-hue"),
  },
  {
    name: "Banh pia Soc Trang",
    description: "Banh pia nhan dau xanh, sau rieng, trung muoi.",
    image_url: image("banh-pia-soc-trang"),
  },
];

const products = [
  {
    shopName: "Cua hang Dac San Ha Noi",
    specialtyName: "O mai Ha Noi",
    name: "O mai mo gung Ha Noi hop 300g",
    image_url: image("o-mai-mo-gung-300g"),
    price: 85000,
    description: "O mai mo xao gung vi chua ngot, cay am, dong hop 300g.",
    countInStock: 120,
    rating: 4.7,
    sold: 38,
    discount: 10,
  },
  {
    shopName: "Cua hang Dac San Ha Noi",
    specialtyName: "O mai Ha Noi",
    name: "O mai sau bao tu 250g",
    image_url: image("o-mai-sau-bao-tu-250g"),
    price: 79000,
    description: "Sau bao tu gion, vi chua cay man ngot can bang.",
    countInStock: 95,
    rating: 4.6,
    sold: 24,
    discount: 0,
  },
  {
    shopName: "Cua hang Dac San Ha Noi",
    specialtyName: "Che Thai Nguyen",
    name: "Tra non tom Thai Nguyen 200g",
    image_url: image("tra-non-tom-thai-nguyen-200g"),
    price: 145000,
    description: "Tra non tom huong com nhe, nuoc xanh trong, hau ngot.",
    countInStock: 60,
    rating: 4.8,
    sold: 41,
    discount: 5,
  },
  {
    shopName: "Qua Hue Xua",
    specialtyName: "Me xung Hue",
    name: "Me xung deo Hue goi 500g",
    image_url: image("me-xung-deo-hue-500g"),
    price: 68000,
    description: "Me xung deo thom mui me rang, phu hop dung tra.",
    countInStock: 150,
    rating: 4.5,
    sold: 57,
    discount: 8,
  },
  {
    shopName: "Qua Hue Xua",
    specialtyName: "Me xung Hue",
    name: "Me xung gion Hue hop 350g",
    image_url: image("me-xung-gion-hue-350g"),
    price: 72000,
    description: "Me xung gion, ngot vua, dong hop tien lam qua.",
    countInStock: 80,
    rating: 4.4,
    sold: 18,
    discount: 0,
  },
  {
    shopName: "Banh Pia Tan Hung",
    specialtyName: "Banh pia Soc Trang",
    name: "Banh pia sau rieng trung muoi hop 6 cai",
    image_url: image("banh-pia-sau-rieng-trung-muoi-6-cai"),
    price: 118000,
    description: "Banh pia nhan sau rieng, dau xanh va trung muoi.",
    countInStock: 100,
    rating: 4.7,
    sold: 63,
    discount: 12,
  },
  {
    shopName: "Banh Pia Tan Hung",
    specialtyName: "Banh pia Soc Trang",
    name: "Banh pia mini dau xanh 400g",
    image_url: image("banh-pia-mini-dau-xanh-400g"),
    price: 89000,
    description: "Banh pia mini nhan dau xanh, it ngot, de chia phan.",
    countInStock: 130,
    rating: 4.3,
    sold: 29,
    discount: 0,
  },
];

const upsertBySlug = async (Model, data) => {
  const slug = data.slug || makeSlug(data.name);
  return Model.findOneAndUpdate(
    { slug },
    { $set: { ...data, slug } },
    { upsert: true, new: true, runValidators: true }
  );
};

const seed = async () => {
  await mongoose.connect(mongoUri);

  const shopByName = new Map();
  for (const shop of shops) {
    const { specialtyNames, ...shopData } = shop;
    const doc = await upsertBySlug(Shop, {
      ...shopData,
      geohash: encodeGeohash(shop.latitude, shop.longitude),
      location: {
        type: "Point",
        coordinates: [shop.longitude, shop.latitude],
      },
      status: "active",
    });
    shopByName.set(shop.name, doc);
  }

  const specialtyByName = new Map();
  for (const specialty of specialties) {
    const doc = await upsertBySlug(Specialty, {
      ...specialty,
      created_by: null,
      created_by_role: "admin",
      shop_id: null,
      approval_status: "approved",
      rejected_reason: "",
      reviewed_by: null,
      reviewed_at: new Date(),
      status: "active",
    });
    specialtyByName.set(specialty.name, doc);
  }

  for (const shop of shops) {
    const shopDoc = shopByName.get(shop.name);
    for (const specialtyName of shop.specialtyNames) {
      const specialty = specialtyByName.get(specialtyName);
      await mongoose.connection.collection("shop_specialties").updateOne(
        { shop_id: shopDoc._id, specialty_id: specialty._id },
        {
          $set: {
            shop_id: shopDoc._id,
            specialty_id: specialty._id,
            is_featured: true,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
    }
  }

  for (const product of products) {
    const shop = shopByName.get(product.shopName);
    const specialty = specialtyByName.get(product.specialtyName);

    await upsertBySlug(Product, {
      shop_id: shop._id,
      specialty_id: specialty._id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
      description: product.description,
      countInStock: product.countInStock,
      rating: product.rating,
      sold: product.sold,
      discount: product.discount,
    });
  }

  console.log("Seed product mock data completed");
  console.log(`Shops: ${shops.length}`);
  console.log(`Specialties: ${specialties.length}`);
  console.log(`Products: ${products.length}`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
