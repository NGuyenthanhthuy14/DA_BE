import authRoute from './auth.route'
import userRoute from './user.route'
import product from './product.route'
import shopRoute from './shop.route'
import specialtyRoute from './specialty.route'
import adminRoute from './admin'
import vendorRoute from './vendor'
import categoryRoute from './category.route'
import orderRoute from './order.route'

const routes = (app) => {
    app.use('/api/auth', authRoute)
    app.use('/api/user', userRoute)
    app.use('/api/product',product)
    app.use("/api/shops", shopRoute);
    app.use("/api/specialties", specialtyRoute);
    app.use("/api/order", orderRoute);
    app.use("/api/categories", categoryRoute);
    app.use("/api/admin", adminRoute);
    app.use("/api/vendor", vendorRoute);
}
module.exports = routes
