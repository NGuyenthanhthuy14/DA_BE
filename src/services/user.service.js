import db from '../models'
import jwt from 'jsonwebtoken'
export const updateUserService = (id,data) => (new Promise(async(resolve,reject)=> {
    try {
        console.log(id,data)
        const checkExist = await db.User.findById(id)
        if(!checkExist){
            resolve({
                err: 1,
                mess: 'không tìm thấy id người dùng'
            })
            return
        }
       const response = await db.User.findByIdAndUpdate(id, data, {new: true} )
       resolve({
         err: response ? 0 : 1,
         mess: response ? 'cập nhật thành công' : 'cập nhật thất bại',
         data:'data người dùng sau up date ' + response
       })
    //    console.log(response)
    }catch(err){
       reject(err)
    }
}))

export const deleteUserService  = (id) => (new Promise(async(resolve,reject)=> {
    try {
        
        const checkExist = await db.User.findById(id)
        if(!checkExist){
            resolve({
                err: 1,
                mess: 'người dùng không tồn tại'
            })
            return
        }
        const response = await db.User.findByIdAndDelete(id)
        resolve({
            err: response ? 0 : 1,
            mess: response ? "xóa user thành công" : 'xóa user thất bại'
        })
    }catch(err){
        reject(err)
    }
}))

export const getAllUserService = () => (new Promise(async(resolve,reject)=> {
    try{
        const response = await db.User.find()
        resolve({
            err: response ? 0 : 1,
            mess: response ?'láy tất cả người dùng thành công' : 'lấy tất cả người dùng thất bại',
            data: response
        })
    }catch(err){
        reject(err)
    }
}))

export const getDetailUserService = (id,token) => (new Promise(async(resolve,reject)=> {
    try {
        // console.log('accessToken nhận từ refresh', token)
        const newToken = token.split(' ')[1]
        jwt.verify(newToken,'abcdefgh',async(err,decode)=> {
            if(err){
                resolve({
                    err: 1,
                    mess: 'accessToken hết hạn hoặc k hợp lệ'
                })
            }
            const response = await db.User.findById(id)
            if(!response){
                resolve({
                    err: 1,
                    mess: 'không tìm thấy id người dùng'
                })
                return
            }
           resolve({
             err: response ? 0 : 1,
             mess: response ? 'tìm người dùng thành công' : 'tìm người dùng thất bại',
             data: response
           })
        })
        
    //    console.log(response)
    }catch(err){
       reject(err)
    }
}))

export const deleteUserAllService = (ids) => (new Promise(async(resolve,reject)=>{
    try {
        const response = await db.User.deleteMany({_id: ids})
        resolve({
            err: response ? 0 : 1,
            mess: response ? 'xóa nhiều user thành công' : 'xóa nhiều user thất bại'
        })
    } catch (error) {
        reject(error)
    }
}))
