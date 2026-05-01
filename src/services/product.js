import db from '../models'

export const createProductService =(body) => (new Promise(async(resolve,reject)=> {
    try {
        const {name,image, type, price, countInStock,rating,description, shop_id} = body
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
        const response = await db.Product.create({
            name,
            image,
            type, 
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

export const getDetailProductService = (id) => (new Promise(async(resolve,reject)=>{
    try {
        const response = await db.Product.findById(id)
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'lấy chi tiết sản phẩm thành công' : 'sản phẩm không tồn tại',
            data: response
        })
    } catch (error) {
        reject(error)
    }
}))

export const getAllProductService = (limit,page,sort,filter) => (new Promise(async(resolve,reject)=>{
    try {
        const totalProducts = await db.Product.countDocuments()
        if(filter){
            // console.log(filter)
            const response  = await db.Product.find({[filter[0]]: {'$regex': filter[1] }}).limit(limit).skip(limit * (page -1))
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
                $match: {
                    "shop.status": "active",
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