import * as service from '../services'
import joi from 'joi'
import {password,confirmPassword,email} from '../helpers/joi_validate'
export const register = async (req, res) => {
  try {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
      confirmPassword: joi
        .string()
        .valid(joi.ref("password"))
        .required()
        .messages({
          "any.only": "Mật khẩu nhập lại không khớp",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        err: 1,
        mess: error.details[0].message,
      });
    }

    const response = await service.registerService(req.body);

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: 1,
      mess: "Có lỗi ở server",
    });
  }
};

export const login = async(req,res) => {
    try{
        const {error} = joi.object({email,password}).validate(req.body)
        if(error) return res.status(400).json({
            err:1,
            mess:  error.details[0].message
        })
        const response = await service.loginService(req.body)
        const {refreshToken, ...newResponse} = response
        // console.log(response)
        res.cookie('refreshToken',refreshToken, {
            httpOnly : true,
            sercure: false,
            samesite: 'strict'
        })
        return res.status(200).json(newResponse)
    }catch(err){
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server',
        })
    }
}

export const updateUser = async(req,res) => {
    try {
        // console.log(req.params)
        const id = req.params.id
        if(!id) return res.status(404).json({
            err: 1,
            mess: 'user id is required'
        })
        const data = req.body
        const response = await service.updateUserService(id,data)
        return res.status(200).json(response)
    } catch (err) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const deleteUser = async(req,res)  => {
    try {
        const id = req.params.id
        if(!id) return res.status(404).json({
            err: 1,
            mess: 'id is required'
        })
        const response = await service.deleteUserService(id)
        return res.status(200).json(response)
    }catch(err){
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
} 

export const getAllUser = async(req,res) => {
    try {
        const response = await service.getAllUserService()
        return res.status(200).json(response)
    }catch(err){
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const getDetailUser = async(req,res) => {
    try {
        const id = req.params.id
        const token = req.headers['token']
        console.log(token)
        if(!id) return res.status(404).json({
            err: 1,
            mess: 'id is required'
        })
        const response = await service.getDetailUserService(id,token)
        return res.status(200).json(response)
    }catch(err){
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const refreshToken = async(req,res)=> {
    // console.log(req.cookies.refreshToken)
    try {
        const token = req.cookies.refreshToken
        if(!token){
            return res.status(404).json({
                err: 1,
                mess: 'refresh token is required'
            })
        }
        const response = await service.refreshTokenService(token)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}

export const logout = async(req,res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });
        return res.status(200).json({
            err: 0,
            mess: 'đăng xuất thành công'
        })
    }catch(error){
        return res.status(500).json({
            err: 1,
            mess:"có lỗi ở server"
        })
    }
}

export const deleteUserAll = async(req,res)=> {
    try {
        const ids = req.body
        if(!ids) return res.status(400).json({
            err: 1,
            mess: 'required ids'
        })
        const response = await service.deleteUserAllService(ids)
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({
            err: 1,
            mess: 'có lỗi ở server'
        })
    }
}