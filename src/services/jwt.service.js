import jwt from 'jsonwebtoken'

export const generateAccessToken = async(payload) => {
    // console.log(payload)
    const accessToken = jwt.sign({...payload},'abcdefgh',{expiresIn: '20d'})
    return accessToken
}

export const generateRefreshToken = async(payload) => {
    // console.log(payload)
    const refreshToken = jwt.sign({...payload},'abcdefgh',{expiresIn: '365d'})
    return refreshToken
}

export const refreshTokenService = (token)=> (new Promise(async(resolve,reject)=> {
    try {
        jwt.verify(token,'abcdefgh',async(err,decode)=> {
            if(err){
                resolve({
                    err: 1,
                    mess: 'có vấn đề với refeshtoken'
                })
            }
            const access_token = await generateAccessToken({
                id: decode?.id,
                isAdmin: decode?.isAdmin
            })
            // console.log(decode)
            resolve({
                err: access_token ? 0 : 1,
                new_access_token: access_token
            })
            // console.log('access_token',access_token)
        })
    }catch(err){
        reject(err)
    }
}))