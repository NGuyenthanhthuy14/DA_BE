import joi from 'joi'
import {name, image_url, category_id, specialty_id, price, countInStock,rating,description,shop_id} from '../helpers/joi_validate'
import * as service from '../services'
export const createProduct = async(req,res) => {
   try {
    console.log(req.body)
    const {error} = joi.object({name, image_url, category_id, specialty_id, price, countInStock,rating,description,shop_id}).validate(req.body)
    if(error) return res.status(400).json({
        err: 1,
        mess: error.message || 'dữ liệu sản phẩm sai hoặc không đầy đủ'
    })
    
    const data = req.body
    const response = await service.createProductService(data)
   
    return res.status(200).json(response)
   }catch(err){
    return res.status(500).json({
        err: 1,
        mess: err
    })
   }
}

export const deleteProduct = async(req,res) => {
    try {
        const id = req.params.id
        if(!id) return res.status(400).jdon({
            err: 1,
            mess: 'required id'
        })
        const response = await service.deleteProductService(id)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const getDetailProduct = async(req,res) => {
    try {
        const id = req.params.id
        if(!id) return res.status(400).json({
            err: 1,
            mess: 'required id'
        })
        const response = await service.getDetailProductService(id)
        return res.status(200).json(response)
    }catch(error){
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const getAllProduct = async(req,res) => {
    try {
        const {limit, page, sort, filter} = req.query
        const response = await service.getAllProductService(Number(limit) || 11,Number(page) || 1, sort,filter)
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            err: 1,
            mess: error.message || 'có lỗi ở server'
        })
    }
}

export const updateProduct = async(req,res) => {
    try {
        const id = req.params.id
        console.log(id)
        if(!id) return res.status(400).json({
            err: 1,
            mess: 'required id'
        })
        const response = await service.updateProductService(id,req.body)
        return res.status(200).json(response)
    } catch (error) {
        
    }
}

export const deleteProductAll = async(req,res)=> {
    try {
        const ids = req.body
        if(!ids) return res.status(400).json({
            err: 1,
            mess: 'required ids'
        })
        const response = await service.deleteProductAllService(ids)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const getAllType = async(req,res)=> {
    try{
        const response = await service.getAllTypeService()
        return res.status(200).json(response)
    }catch(error){
        console.log(error)
        return res.status(500).json({
            err: 1,
            mess: error.message || 'có lỗi ở server'
        })
    }
}

export const getNearbyProducts = async(req,res)=>{
    try {
        const { lat, lng, maxKm, limit } = req.query
        if(!lat || !lng) return res.status(400).json({
            err: 1,
            mess: 'cần truyền lat và lng'
        })
        const response = await service.getNearbyProductsService(
            Number(lat),
            Number(lng),
            Number(maxKm) || 20,
            Number(limit) || 20
        )
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

