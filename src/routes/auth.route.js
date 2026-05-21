import * as controllers from '../controllers'
import express from 'express'
import {verifyRoleAdmin} from '../middleware/verifyRole'
const router = express.Router()
router.post('/register',controllers.register)
router.post('/login',controllers.login)
router.put('/update-user/:id?',controllers.updateUser)
router.delete('/delete-user/:id?',controllers.deleteUser)
router.get('/getAllUser',controllers.getAllUser)
router.get('/get-detail-user/:id?',controllers.getDetailUser)
router.post('/refreshToken',controllers.refreshToken)
router.post('/logout',controllers.logout)
router.delete('/deleteAll',controllers.deleteUserAll)
module.exports = router