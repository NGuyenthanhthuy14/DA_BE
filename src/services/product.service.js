import db from '../models'
import Shop from '../models/shop.model';
import Specialty from '../models/SpecialtyModel';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { buildGeohashPrefixRegexes } from '../utils/geohash.util';

const getVendorShop = async (ownerId) => {
    return await Shop.findOne({ owner_id: String(ownerId) });
};

const getVendorShopOrThrow = async (ownerId) => {
    const shop = await getVendorShop(ownerId);
    if (!shop) {
        throw new Error('SHOP_NOT_FOUND');
    }
    return shop;
};

const getFilterQuery = (filter) => {
    if (!filter) return {};

    let key;
    let value;
    if (Array.isArray(filter)) {
        [key, value] = filter;
    } else if (typeof filter === 'object') {
        [key, value] = Object.entries(filter)[0] || [];
    }

    if (!key) return {};

    if (key === 'shop_id' || key === 'specialty_id') {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return null;
        }
        return { [key]: value };
    }

    return { [key]: { '$regex': value, '$options': 'i' } };
};

const getActiveShopProductQuery = async (baseQuery = {}) => {
    const activeShopIds = await Shop.find({ status: 'active' }).distinct('_id');

    return {
        $and: [
            baseQuery,
            {
                $or: [
                    { shop_id: null },
                    { shop_id: { $exists: false } },
                    { shop_id: { $in: activeShopIds } },
                    { shop_id: { $in: activeShopIds.map((id) => id.toString()) } },
                ],
            },
        ],
    };
};

const ensureApprovedSpecialty = async (specialtyId) => {
    if (!specialtyId) return true;
    if (!mongoose.Types.ObjectId.isValid(specialtyId)) return false;

    const specialty = await Specialty.findOne({
        _id: specialtyId,
        status: 'active',
        approval_status: 'approved',
    }).lean();

    return Boolean(specialty);
};

const getSortQuery = (sort) => {
    if (!sort) return {};

    if (Array.isArray(sort)) {
        return { [sort[1]]: sort[0] };
    }

    if (typeof sort === 'object') {
        return sort;
    }

    return {};
};

export const createProductService =(body) => (new Promise(async(resolve,reject)=> {
    try {
        const {name, image_url, specialty_id, price, countInStock,rating,description, shop_id} = body
        const checkExist = await db.Product.findOne({
            name: name
        })
        if(checkExist){
            resolve({
                err: 1,
                mess: 'tên sản phẩm đã tồn tại vui lòng chọn sản phẩm khác'
            })
            return
        }

        const validSpecialty = await ensureApprovedSpecialty(specialty_id);
        if (!validSpecialty) {
            resolve({
                err: 1,
                mess: 'dac san khong ton tai hoac chua duoc duyet'
            })
            return
        }
        
        let slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }

        const response = await db.Product.create({
            name,
            slug,
            image_url,
            specialty_id: specialty_id || null,
            price, 
            countInStock,
            rating,
            description,
            shop_id: shop_id || null
         })
         resolve({
            err: response ? 0 : 1,
            mess: response ? 'tạo sản phẩm thành công' : 'tạo sản phẩm thất bại',
            data: response
         })
    } catch (error) {
        reject(error)
    }
}))

export const createVendorProductService = (ownerId, body) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const response = await createProductService({
            ...body,
            shop_id: shop._id,
        });

        resolve(response);
    } catch (error) {
        reject(error);
    }
}))

export const getVendorProductsService = (ownerId, limit, page, sort, filter) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const filterQuery = getFilterQuery(filter);

        if (filterQuery === null) {
            resolve({
                err: 0,
                mess: 'lay san pham cua shop thanh cong',
                data: [],
                totalProduts: 0,
                currentPage: page,
                totalPage: 0
            });
            return;
        }

        const query = {
            ...filterQuery,
            shop_id: shop._id,
        };
        const sortQuery = getSortQuery(sort);
        const totalProducts = await db.Product.countDocuments(query);
        const response = await db.Product.find(query)
            .limit(limit)
            .skip(limit * (page - 1))
            .sort(sortQuery);

        resolve({
            err: response ? 0 : 1,
            mess: response ? 'lay san pham cua shop thanh cong' : 'lay san pham cua shop that bai',
            data: response,
            totalProduts: totalProducts,
            currentPage: page,
            totalPage: Math.ceil(totalProducts / limit)
        });
    } catch (error) {
        reject(error);
    }
}))

export const getVendorDetailProductService = (ownerId, id) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const response = await db.Product.findOne({
            _id: id,
            shop_id: shop._id,
        });

        resolve({
            err: response ? 0 : 1,
            mess: response ? 'lay chi tiet san pham thanh cong' : 'san pham khong ton tai hoac khong thuoc shop cua ban',
            data: response
        });
    } catch (error) {
        reject(error);
    }
}))

export const updateVendorProductService = (ownerId, id, data) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const checkExist = await db.Product.findOne({
            _id: id,
            shop_id: shop._id,
        });

        if (!checkExist) {
            resolve({
                err: 1,
                mess: 'san pham khong ton tai hoac khong thuoc shop cua ban'
            });
            return;
        }

        const updateData = { ...data };
        delete updateData.shop_id;

        if (Object.prototype.hasOwnProperty.call(updateData, 'specialty_id')) {
            if (!updateData.specialty_id) {
                updateData.specialty_id = null;
            }
            const validSpecialty = await ensureApprovedSpecialty(updateData.specialty_id);
            if (!validSpecialty) {
                resolve({
                    err: 1,
                    mess: 'dac san khong ton tai hoac chua duoc duyet'
                });
                return;
            }
        }

        if (updateData.name) {
            let newSlug = slugify(updateData.name, { lower: true, strict: true, locale: 'vi' });
            if (!newSlug) {
                newSlug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
            }
            updateData.slug = newSlug;
        }

        const response = await db.Product.findByIdAndUpdate(id, updateData, { new: true });
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'cap nhat san pham thanh cong' : 'cap nhat san pham that bai',
            data: response
        });
    } catch (error) {
        reject(error);
    }
}))

export const deleteVendorProductService = (ownerId, id) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const response = await db.Product.findOneAndDelete({
            _id: id,
            shop_id: shop._id,
        });

        resolve({
            err: response ? 0 : 1,
            mess: response ? 'xoa san pham thanh cong' : 'san pham khong ton tai hoac khong thuoc shop cua ban'
        });
    } catch (error) {
        reject(error);
    }
}))

export const deleteVendorProductAllService = (ownerId, ids) => (new Promise(async(resolve, reject) => {
    try {
        const shop = await getVendorShopOrThrow(ownerId);
        const response = await db.Product.deleteMany({
            _id: { $in: ids },
            shop_id: shop._id,
        });

        resolve({
            err: response ? 0 : 1,
            mess: response ? 'xoa nhieu san pham thanh cong' : 'xoa nhieu san pham that bai',
            deletedCount: response?.deletedCount || 0
        });
    } catch (error) {
        reject(error);
    }
}))

export const deleteProductService = (id) => (new Promise(async(resolve,reject)=>{
    try {
        const checkExist = await db.Product.findById(id)
        if(!checkExist){
            resolve({
                err: 1,
                mess:'sản phẩm không tồn tại'
            })
            return
        }
        const response = await db.Product.findByIdAndDelete(id)
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'xóa sản phẩm thành công' : 'xóa sản phẩm thất bại'
        })
    } catch (error) {
        reject(error)
    }
}))

export const getDetailProductService = (id, { activeShopOnly = false } = {}) => (new Promise(async(resolve,reject)=>{
    try {
        let response = await db.Product.findById(id).lean()
        if (response && activeShopOnly && response.shop_id) {
            const shop = await Shop.findOne({ _id: response.shop_id, status: 'active' }).lean();
            if (!shop) response = null;
        }
        if (response) {
            const [reviews, ratingStats] = await Promise.all([
                db.ProductReview.find({ product: id })
                    .populate('user', 'full_name avatar_url email')
                    .sort({ created_at: -1 })
                    .lean(),
                db.ProductReview.aggregate([
                    { $match: { product: new mongoose.Types.ObjectId(id) } },
                    {
                        $group: {
                            _id: '$product',
                            averageRating: { $avg: '$rating' },
                            reviewCount: { $sum: 1 },
                            fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                            fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                            threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                            twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                            oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                        }
                    }
                ])
            ])
            const stats = ratingStats[0]
            const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : (response.rating || 0)
            response.rating = response.rating ?? averageRating
            response.reviews = reviews
            response.reviewCount = stats?.reviewCount || reviews.length
            response.ratingSummary = {
                averageRating,
                total: stats?.reviewCount || reviews.length,
                stars: {
                    5: stats?.fiveStar || 0,
                    4: stats?.fourStar || 0,
                    3: stats?.threeStar || 0,
                    2: stats?.twoStar || 0,
                    1: stats?.oneStar || 0,
                }
            }
        }
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'lấy chi tiết sản phẩm thành công' : 'sản phẩm không tồn tại',
            data: response
        })
    } catch (error) {
        reject(error)
    }
}))

export const getAllProductService = (limit,page,sort,filter, { activeShopOnly = false } = {}) => (new Promise(async(resolve,reject)=>{
    try {
        if (activeShopOnly) {
            const baseQuery = getFilterQuery(filter);
            if (baseQuery === null) {
                resolve({
                    err: 0,
                    mess: 'lay tat ca san pham thanh cong',
                    data: [],
                    totalProduts : 0,
                    currentPage: page,
                    totalPage:  0
                });
                return;
            }

            const query = await getActiveShopProductQuery(baseQuery);
            const totalProducts = await db.Product.countDocuments(query);
            const response = await db.Product.find(query)
                .limit(limit)
                .skip(limit * (page - 1))
                .sort(getSortQuery(sort));

            resolve({
                err: response ? 0 : 1,
                mess: response ? 'lay tat ca san pham thanh cong' : 'lay tat ca san pham that bai',
                data: response,
                totalProduts : totalProducts,
                currentPage: page,
                totalPage: Math.ceil(totalProducts / limit)
            });
            return;
        }

        const totalProducts = await db.Product.countDocuments()
        if(filter){
            // console.log(filter)
            let query = {};
            if (filter[0] === 'shop_id' || filter[0] === 'specialty_id') {
                if (!mongoose.Types.ObjectId.isValid(filter[1])) {
                    resolve({
                        err: 0,
                        mess: 'lấy tất cả sản phẩm thành công',
                        data: [],
                        totalProduts : 0,
                        currentPage: page,
                        totalPage:  0
                    });
                    return;
                }
                query[filter[0]] = filter[1];
            } else {
                query[filter[0]] = {'$regex': filter[1], '$options': 'i'};
            }
            const response  = await db.Product.find(query).limit(limit).skip(limit * (page -1))
            resolve({
                err: response ? 0 : 1,
                mess: response ? 'lấy tất cả sản phẩm thành công' : 'lấy tất cả sản phẩm thất bại',
                data: response,
                totalProduts : totalProducts,
                currentPage: page,
                totalPage:  Math.ceil( totalProducts / limit)
            })
            return
        }
        if(sort){
            const label = sort[1]
            const order = sort[0] // thứ tự
            const response = await db.Product.find().limit(limit).skip(limit * (page -1)).sort({[label]: order})
            resolve({
                err: response ? 0 : 1,
                mess: response ? 'lấy tất cả sản phẩm thành công' : 'lấy tất cả sản phẩm thất bại',
                data: response,
                totalProduts : totalProducts,
                currentPage: page,
                totalPage:  Math.ceil( totalProducts / limit)
            })
            return
        }
            const response = await db.Product.find().limit(limit).skip(limit * (page -1))
            resolve({
                err: response ? 0 : 1,
                mess: response ? 'lấy tất cả sản phẩm thành công' : 'lấy tất cả sản phẩm thất bại',
                data: response,
                totalProduts : totalProducts,
                currentPage: page,
                totalPage:  Math.ceil( totalProducts / limit)
            })
    } catch (error) {
        reject(error)
    }
}))

export const updateProductService = (id, data) => (new Promise(async (resolve, reject) => {
    try {
        console.log(data, id)
        const checkExist = await db.Product.findById(id);
        if (!checkExist) {
            resolve({
                err: 1,
                mess: 'không tìm thấy id sản phẩm'
            });
            return;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'specialty_id')) {
            if (!data.specialty_id) {
                data.specialty_id = null;
            }
            const validSpecialty = await ensureApprovedSpecialty(data.specialty_id);
            if (!validSpecialty) {
                resolve({
                    err: 1,
                    mess: 'dac san khong ton tai hoac chua duoc duyet'
                });
                return;
            }
        }

        if (data.name) {
            let newSlug = slugify(data.name, { lower: true, strict: true, locale: 'vi' });
            if (!newSlug) {
                newSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
            }
            data.slug = newSlug;
        }

        const response = await db.Product.findByIdAndUpdate(id, data, {new: true} )
        // console.log(response)
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'cập nhật sản phẩm thành công' : 'cập nhật sản phẩm thất bại',
            data: response
        })
    } catch (err) {
        reject(err);
    }
}));

export const deleteProductAllService= (ids) => (new Promise(async(resolve,reject)=>{
    try {
        const response = await db.Product.deleteMany({_id: ids})
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'xóa nhiều sản phẩm thành côngn' : 'xóa nhiều sản phẩm thất bại'
        })
    } catch (error) {
        reject(error)
    }
}))

export const getAllTypeService = () => (new Promise(async(resolve,reject)=> {
    try {
        const response = await db.Product.distinct('type')
        resolve({
            err: response ? 0 :1,
            mess: response ? 'lấy type sản phẩm thành công' : 'lấy type sản phẩm thất bại',
            data: response ? response : null
        })
    } catch (error) {
        reject(error)
    }
}))

export const getNearbyProductsService = (lat, lng, maxKm = 20, limit = 20) => (new Promise(async (resolve, reject) => {
    try {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        const maxKmNum = Number(maxKm);
        const limitNum = Number(limit);

        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
            resolve({
                err: 1,
                mess: 'tọa độ không hợp lệ',
                data: [],
                total: 0,
            });
            return;
        }

        const geohashRegexes = buildGeohashPrefixRegexes(
            latNum,
            lngNum,
            Number.isFinite(maxKmNum) && maxKmNum > 0 ? maxKmNum : 20
        );

        const response = await db.Product.aggregate([
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
                                    ],
                                },
                                status: "active",
                                $or: [
                                    { geohash: { $in: geohashRegexes } },
                                    { geohash: { $in: ["", null] } },
                                ],
                            },
                        },
                    ],
                    as: "shop",
                },
            },
            {
                $unwind: {
                    path: "$shop",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $addFields: {
                    distanceKm: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $sqrt: {
                                            $add: [
                                                { $pow: [{ $subtract: ["$shop.longitude", lngNum] }, 2] },
                                                { $pow: [{ $subtract: ["$shop.latitude", latNum] }, 2] },
                                            ],
                                        },
                                    },
                                    111,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
            {
                $match: {
                    distanceKm: { $lte: Number.isFinite(maxKmNum) && maxKmNum > 0 ? maxKmNum : 20 },
                },
            },
            {
                $sort: { distanceKm: 1 },
            },
            {
                $limit: Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20,
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    type: 1,
                    price: 1,
                    rating: 1,
                    description: 1,
                    discount: 1,
                    sold: 1,
                    distanceKm: 1,
                    shop: {
                        _id: "$shop._id",
                        name: "$shop.name",
                        slug: "$shop.slug",
                        address: "$shop.address",
                        formatted_address: "$shop.formatted_address",
                        cover_image: "$shop.cover_image",
                        latitude: "$shop.latitude",
                        longitude: "$shop.longitude",
                    },
                },
            },
        ]);

        resolve({
            err: 0,
            mess: 'lấy sản phẩm gần bạn thành công',
            data: response,
            total: response.length,
        });
    } catch (error) {
        reject(error);
    }
}))
