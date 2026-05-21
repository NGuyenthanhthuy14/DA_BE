import express from 'express'
const router = express.Router()
import * as controllers from '../controllers'
import { verifyRoleAdmin } from '../middleware/verifyRole'
router.post('/create',controllers.createProduct)
router.put('/update/:id?',controllers.updateProduct)
router.get('/get-all',controllers.getAllProduct)
router.get('/nearby',controllers.getNearbyProducts)
router.get('/get-detail/:id?',controllers.getDetailProduct)
router.delete('/delete/:id?',controllers.deleteProduct)
router.delete('/deleteAll',controllers.deleteProductAll)
router.get('/get-all-type',controllers.getAllType)
module.exports = router